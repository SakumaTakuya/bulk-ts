import copy
import json
import sys
import argparse

def flatten_json(data):
    """
    Flattens a JSON object according to specific rules, including deduplication
    based on values found in a 'common' block. Generates a key transformation map.

    Args:
        data: A Python dictionary representing the JSON object to flatten.

    Returns:
        A tuple: (final_result_dict, key_map_dict)
    """
    final_result = {}
    key_map = {} # Stores original_path: final_key_or_dedup_target_key
    value_to_common_key_map = {} # Stores value: final_common_key_name

    processed_input_data = copy.deepcopy(data)

    # Helper function to flatten the 'common' block
    def _flatten_and_populate_common(current_data, current_common_prefix, original_path_prefix, target_result, current_key_map, value_map):
        if not isinstance(current_data, dict):
            return

        for key, value in current_data.items():
            # Key as it will appear in the final_result (without "common.")
            final_key_for_result = f"{current_common_prefix}.{key}" if current_common_prefix else key
            # Original full path of this item
            original_full_path = f"{original_path_prefix}.{key}" if original_path_prefix == "common" and not current_common_prefix \
                                 else f"{original_path_prefix}.{current_common_prefix}.{key}" if current_common_prefix \
                                 else f"{original_path_prefix}.{key}"


            if isinstance(value, dict):
                _flatten_and_populate_common(value, final_key_for_result, original_path_prefix, target_result, current_key_map, value_map)
            else:
                target_result[final_key_for_result] = value
                current_key_map[original_full_path] = final_key_for_result
                if value not in value_map:
                    value_map[value] = final_key_for_result

    # Helper function to flatten other items and perform deduplication
    def _flatten_others_and_deduplicate(current_data, current_processing_prefix, original_item_base_path, target_result, current_key_map, common_value_map):
        if not isinstance(current_data, dict):
            # This handles cases where a non-dict is passed directly, though loop below is primary.
            # E.g. if data = {"key": "value"}, original_item_base_path = "key"
            # This function would be called with current_data="value", current_processing_prefix="", original_item_base_path="key"
            # This specific path needs careful review or might be unused if only dicts are recursed upon.
            # The loop `for key, value in current_data.items()` is the main path.
            return


        for key, value in current_data.items():
            # Path as it would be if not deduplicated
            potential_final_key = f"{current_processing_prefix}.{key}" if current_processing_prefix else key
            # Original full path of this item
            original_full_path = f"{original_item_base_path}.{key}" # original_item_base_path already includes its own full prefix.

            if isinstance(value, dict):
                _flatten_others_and_deduplicate(value, potential_final_key, original_full_path, target_result, current_key_map, common_value_map)
            else:
                if value in common_value_map:
                    # Value is a duplicate of a common value, map original to the common key's final name
                    current_key_map[original_full_path] = common_value_map[value]
                    # Do not add to target_result as it's a duplicate
                else:
                    # Value is not a duplicate, add to result and map to its own new key
                    target_result[potential_final_key] = value
                    current_key_map[original_full_path] = potential_final_key
    
    # Step 1: Process 'common' block if it exists
    if 'common' in processed_input_data and isinstance(processed_input_data['common'], dict):
        common_data_block = processed_input_data.pop('common')
        # For items directly under 'common', their original_path_prefix starts with "common"
        # Their current_common_prefix for forming the final_key starts empty.
        _flatten_and_populate_common(common_data_block, "", "common", final_result, key_map, value_to_common_key_map)

    # Step 2: Process the rest of the data (top-level items)
    # Each top-level key (e.g., "navigation", "home") becomes its own original_item_base_path
    for top_key, top_value in processed_input_data.items():
        if isinstance(top_value, dict):
            _flatten_others_and_deduplicate(top_value, top_key, top_key, final_result, key_map, value_to_common_key_map)
        else: # Top-level item that is not a dictionary
            original_full_path = top_key
            if top_value in value_to_common_key_map:
                key_map[original_full_path] = value_to_common_key_map[top_value]
            else:
                final_result[original_full_path] = top_value
                key_map[original_full_path] = original_full_path
                
    return final_result, key_map

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Flatten a JSON object and generate a key transformation map.")
    parser.add_argument("input_file", help="Path to the input JSON file.")
    parser.add_argument("-o", "--output_file", default="output.json", help="Path to save the flattened JSON data (default: output.json).")
    parser.add_argument("-m", "--map_file", default="key_map.json", help="Path to save the key transformation map (default: key_map.json).")
    parser.add_argument("--test", action="store_true", help="Run internal test cases instead of file processing.")

    args = parser.parse_args()

    if args.test:
        print("--- Running Internal Tests for Key Map Generation ---")

        test_case_1_input = {
            "navigation": { "home": "Home", "profile": "Profile" },
            "home_settings": { "theme": "Dark", "language": "English" },
            "common": { "language": "English", "save": "Save Changes" }
        }
        # common.language -> language: "English" (value_map["English"]="language")
        # common.save -> save: "Save Changes" (value_map["Save Changes"]="save")
        # navigation.home -> navigation.home: "Home"
        # navigation.profile -> navigation.profile: "Profile"
        # home_settings.theme -> home_settings.theme: "Dark"
        # home_settings.language ("English") -> maps to "language" (from common)
        test_case_1_expected_flat = {
            "language": "English",
            "save": "Save Changes",
            "navigation.home": "Home",
            "navigation.profile": "Profile",
            "home_settings.theme": "Dark"
            # home_settings.language is deduplicated
        }
        test_case_1_expected_map = {
            "common.language": "language",
            "common.save": "save",
            "navigation.home": "navigation.home",
            "navigation.profile": "navigation.profile",
            "home_settings.theme": "home_settings.theme",
            "home_settings.language": "language" # Deduplicated
        }

        flat_result_1, key_map_1 = flatten_json(test_case_1_input)
        
        print("\nTest Case 1:")
        print("Input:", json.dumps(test_case_1_input, indent=2))
        print("Expected Flat:", json.dumps(test_case_1_expected_flat, indent=2))
        print("Actual Flat:", json.dumps(flat_result_1, indent=2))
        print("Expected Map:", json.dumps(test_case_1_expected_map, indent=2))
        print("Actual Map:", json.dumps(key_map_1, indent=2))

        assert flat_result_1 == test_case_1_expected_flat, "Test Case 1 Failed: Flattened data mismatch"
        assert key_map_1 == test_case_1_expected_map, "Test Case 1 Failed: Key map mismatch"
        print("Test Case 1 Passed.")

        # Test case with nested common items and root level item conflict
        test_case_2_input = {
            "user_profile": { "name": "Alex", "preferred_action": "Confirm" },
            "common": {
                "actions": { "confirm": "Confirm", "cancel": "Cancel" },
                "submit": "Submit"
            },
            "submit": "Send Data" # Root level key, different value from common.submit
        }
        # common.actions.confirm -> actions.confirm: "Confirm" (value_map["Confirm"]="actions.confirm")
        # common.actions.cancel -> actions.cancel: "Cancel" (value_map["Cancel"]="actions.cancel")
        # common.submit -> submit: "Submit" (value_map["Submit"]="submit")
        # user_profile.name -> user_profile.name: "Alex"
        # user_profile.preferred_action ("Confirm") -> maps to "actions.confirm"
        # submit ("Send Data") -> kept, as "Send Data" != "Submit" from common.
        # This means final_result will have "submit": "Send Data", overwriting common's "submit".
        # And key_map should reflect this.
        # common.submit maps to "submit"
        # root "submit" maps to "submit" (but its value "Send Data" is what ends up in final_result)

        # The logic for final_result for conflicting keys (common vs non-common) is:
        # 1. Common items are populated first. final_result["submit"] = "Submit"
        # 2. Non-common "submit" with value "Send Data" is processed. "Send Data" is not in value_map.
        #    So, final_result["submit"] becomes "Send Data".
        # This is consistent with previous logic for key conflicts if values differ.

        test_case_2_expected_flat = {
            "actions.confirm": "Confirm",
            "actions.cancel": "Cancel",
            "submit": "Send Data", # Original root "submit" overwrites common.submit due to different value
            "user_profile.name": "Alex"
            # user_profile.preferred_action is deduplicated
        }
        test_case_2_expected_map = {
            "common.actions.confirm": "actions.confirm",
            "common.actions.cancel": "actions.cancel",
            "common.submit": "submit", # Original path of common.submit maps to final key 'submit'
            "user_profile.name": "user_profile.name",
            "user_profile.preferred_action": "actions.confirm", # Deduplicated
            "submit": "submit" # Original path of root 'submit' maps to final key 'submit'
        }
        flat_result_2, key_map_2 = flatten_json(test_case_2_input)

        print("\nTest Case 2:")
        print("Input:", json.dumps(test_case_2_input, indent=2))
        print("Expected Flat:", json.dumps(test_case_2_expected_flat, indent=2))
        print("Actual Flat:", json.dumps(flat_result_2, indent=2))
        print("Expected Map:", json.dumps(test_case_2_expected_map, indent=2))
        print("Actual Map:", json.dumps(key_map_2, indent=2))
        
        assert flat_result_2 == test_case_2_expected_flat, "Test Case 2 Failed: Flattened data mismatch"
        assert key_map_2 == test_case_2_expected_map, "Test Case 2 Failed: Key map mismatch"
        print("Test Case 2 Passed.")

        print("\nAll internal tests passed.")

    else:
        # File processing mode
        try:
            with open(args.input_file, 'r', encoding='utf-8') as f:
                input_data = json.load(f)
        except FileNotFoundError:
            print(f"Error: Input file '{args.input_file}' not found.", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from '{args.input_file}': {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error reading input file '{args.input_file}': {e}", file=sys.stderr)
            sys.exit(1)

        flattened_data, key_transformation_map = flatten_json(input_data)

        try:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                json.dump(flattened_data, f, indent=2, ensure_ascii=False)
            print(f"Flattened data saved to '{args.output_file}'")
        except Exception as e:
            print(f"Error writing flattened data to '{args.output_file}': {e}", file=sys.stderr)
            sys.exit(1)

        try:
            with open(args.map_file, 'w', encoding='utf-8') as f:
                json.dump(key_transformation_map, f, indent=2, ensure_ascii=False)
            print(f"Key transformation map saved to '{args.map_file}'")
        except Exception as e:
            print(f"Error writing key map to '{args.map_file}': {e}", file=sys.stderr)
            sys.exit(1)

pass
