import copy

def flatten_json(data):
    """
    Flattens a JSON object according to specific rules, including deduplication
    based on values found in a 'common' block.

    Args:
        data: A Python dictionary representing the JSON object to flatten.

    Returns:
        A new Python dictionary representing the flattened JSON object.
    """
    final_result = {}
    value_to_common_key_map = {} # Stores value: common_key_name

    processed_input_data = copy.deepcopy(data)

    # Helper function to flatten the 'common' block
    def _flatten_and_populate_common(current_data, current_prefix, target_result, value_map):
        if not isinstance(current_data, dict):
            return

        for key, value in current_data.items():
            new_key = f"{current_prefix}.{key}" if current_prefix else key
            
            if isinstance(value, dict):
                _flatten_and_populate_common(value, new_key, target_result, value_map)
            else:
                # Add to result and map
                # Rule: common items always go into the result.
                # Rule: common items establish values for deduplication.
                # If multiple common items have the same value, the one processed last will set the key in value_map.
                # This is usually fine as we just need to know *if* a value came from common.
                target_result[new_key] = value
                if value not in value_map: # Keep the first common key associated with a value
                    value_map[value] = new_key


    # Helper function to flatten other items and perform deduplication
    def _flatten_others_and_deduplicate(current_data, current_prefix, target_result, common_value_map):
        if not isinstance(current_data, dict):
            return

        for key, value in current_data.items():
            new_key = f"{current_prefix}.{key}" if current_prefix else key

            if isinstance(value, dict):
                _flatten_others_and_deduplicate(value, new_key, target_result, common_value_map)
            else:
                # Deduplication logic:
                # If the value is already provided by a common key, discard this item.
                if value in common_value_map:
                    # Check if the current key is the *same* as the common key that provided this value.
                    # This can happen if a root-level key in the input data has the same name AND value
                    # as a root-level key from the common block. In this case, the common block's version
                    # (already processed) should prevail, and this one is effectively a duplicate.
                    # Example: {"save": "Save Text", "common": {"save": "Save Text"}}
                    # common.save -> final_result["save"] = "Save Text", value_map["Save Text"] = "save"
                    # Then, when processing original "save": "Save Text", its value "Save Text" is in value_map.
                    # common_value_map["Save Text"] is "save". current new_key is "save". They are the same.
                    # This means the item is identical to one from common and should not be re-added or cause issues.
                    # The problem asks to *discard* if value is in common_value_map.
                    pass # Discard
                else:
                    # Prioritization of root keys from original data vs common keys:
                    # The previous version handled this by processing common last.
                    # Now, common is processed first. If `data = {"foo": "A", "common": {"foo": "B"}}`,
                    # common.foo -> final_result["foo"] = "B", value_map["B"] = "foo"
                    # Then, data.foo -> new_key="foo", value="A". "A" is not in value_map.
                    # So, final_result["foo"] will be "A". This overwrites the common value.
                    # This is the opposite of the old Rule 4.
                    # The new rule is "If its value exists... discard this current_flattened_item".
                    # It does NOT say "if key conflicts, prioritize common". It's value-based dedup.

                    # Let's re-verify the example:
                    # "home.save": "Save" and "common.save": "Save"
                    # common.save -> final_result["save"] = "Save", value_map["Save"] = "save"
                    # home.save -> value "Save" IS in value_map. So home.save is discarded. This is correct.

                    # Consider: {"foo": "Outer Foo", "common": {"foo": "Common Foo"}}
                    # common.foo -> final_result["foo"] = "Common Foo", value_map["Common Foo"] = "foo"
                    # data.foo -> value "Outer Foo". Is "Outer Foo" in value_map? No.
                    # So, final_result["foo"] = "Outer Foo". This means non-common overwrites common if keys are same but values differ.
                    # This seems to be the implication of the new rules focusing on value-based deduplication.
                    target_result[new_key] = value
    
    # Step 1: Process 'common' block if it exists
    if 'common' in processed_input_data and isinstance(processed_input_data['common'], dict):
        common_data = processed_input_data.pop('common')
        _flatten_and_populate_common(common_data, "", final_result, value_to_common_key_map)

    # Step 2: Process the rest of the data
    _flatten_others_and_deduplicate(processed_input_data, "", final_result, value_to_common_key_map)
        
    return final_result

if __name__ == '__main__':
    print("--- New Deduplication Logic Tests ---")

    # Test case from the problem description
    dedup_example_input = {
        "navigation": {
            "home": "Home"
        },
        "home": {
            "title": "Workout Tracker",
            "save": "Save" 
        },
        "common": {
            "save": "Save",
            "cancel": "Cancel"
        }
    }
    dedup_expected_output = {
        "navigation.home": "Home",
        "home.title": "Workout Tracker",
        # "home.save" is removed because "Save" is provided by "common.save" (which becomes top-level "save")
        "save": "Save",
        "cancel": "Cancel"
    }
    print("\nTest Case: Deduplication Example from Description")
    output = flatten_json(dedup_example_input)
    print("Input:", dedup_example_input)
    print("Expected:", dedup_expected_output)
    print("Actual:", output)
    assert output == dedup_expected_output, "Deduplication Example Failed"

    # Test case: Value from common is nested
    nested_common_dedup_input = {
        "settings": {
            "theme": "Dark Mode",
            "font": "Arial"
        },
        "common": {
            "themes": {
                "selected": "Dark Mode" # Value "Dark Mode"
            },
            "font": "Generic Font"
        }
    }
    nested_common_dedup_expected = {
        "settings.font": "Arial", # "Dark Mode" from settings.theme is removed
        "themes.selected": "Dark Mode",
        "font": "Generic Font"
    }
    print("\nTest Case: Nested Common Value Deduplication")
    output_nested_common = flatten_json(nested_common_dedup_input)
    print("Input:", nested_common_dedup_input)
    print("Expected:", nested_common_dedup_expected)
    print("Actual:", output_nested_common)
    assert output_nested_common == nested_common_dedup_expected, "Nested Common Value Deduplication Failed"

    # Test case: No common block
    no_common_input = {
        "user": {"name": "John", "email": "john@example.com"},
        "app": {"version": "1.0"}
    }
    no_common_expected = {
        "user.name": "John",
        "user.email": "john@example.com",
        "app.version": "1.0"
    }
    print("\nTest Case: No Common Block")
    output_no_common = flatten_json(no_common_input)
    print("Input:", no_common_input)
    print("Expected:", no_common_expected)
    print("Actual:", output_no_common)
    assert output_no_common == no_common_expected, "No Common Block Test Failed"

    # Test case: Empty common block
    empty_common_input = {
        "user": {"name": "Jane"},
        "common": {}
    }
    empty_common_expected = {
        "user.name": "Jane"
    }
    print("\nTest Case: Empty Common Block")
    output_empty_common = flatten_json(empty_common_input)
    print("Input:", empty_common_input)
    print("Expected:", empty_common_expected)
    print("Actual:", output_empty_common)
    assert output_empty_common == empty_common_expected, "Empty Common Block Test Failed"

    # Test case: No deduplication needed
    no_dedup_needed_input = {
        "header": {"text": "Welcome"},
        "footer": {"copyright": "Corp Inc."},
        "common": {"loading": "Loading..."}
    }
    no_dedup_needed_expected = {
        "header.text": "Welcome",
        "footer.copyright": "Corp Inc.",
        "loading": "Loading..."
    }
    print("\nTest Case: No Deduplication Needed")
    output_no_dedup = flatten_json(no_dedup_needed_input)
    print("Input:", no_dedup_needed_input)
    print("Expected:", no_dedup_needed_expected)
    print("Actual:", output_no_dedup)
    assert output_no_dedup == no_dedup_needed_expected, "No Deduplication Needed Test Failed"

    # Test case: Conflict of keys, but different values (non-common should overwrite if not deduped)
    # This tests the interaction of the new value-based dedup with old key-based prioritization.
    # Old rule: common key value wins for same key.
    # New rule: if value from non-common is in common_map, discard non-common item. Otherwise, keep.
    key_conflict_diff_values_input = {
        "save": "Save Action A", # Root key
        "common": {
            "save": "Save Action B"  # Common key with different value
        }
    }
    # common.save -> final_result["save"] = "Save Action B", value_map["Save Action B"] = "save"
    # data.save -> value "Save Action A". Is "Save Action A" in value_map? No.
    # So, final_result["save"] = "Save Action A". Root key overwrites common key if values differ.
    key_conflict_diff_values_expected = {
        "save": "Save Action A" 
    }
    print("\nTest Case: Key Conflict, Different Values")
    output_key_conflict = flatten_json(key_conflict_diff_values_input)
    print("Input:", key_conflict_diff_values_input)
    print("Expected:", key_conflict_diff_values_expected)
    print("Actual:", output_key_conflict)
    assert output_key_conflict == key_conflict_diff_values_expected, "Key Conflict, Different Values Test Failed"

    # Test case: Multiple common items with the same value, one non-common item with that value
    multi_common_same_value_input = {
        "action1": "Proceed",
        "common": {
            "confirm": "Proceed",
            "next_step": "Proceed"
        }
    }
    # common.confirm -> final_result["confirm"]="Proceed", value_map["Proceed"]="confirm"
    # common.next_step -> final_result["next_step"]="Proceed", value_map["Proceed"] remains "confirm" (or could be "next_step" depending on dict iteration order for value_map population)
    # action1 -> value "Proceed" is in value_map. Discard action1.
    multi_common_same_value_expected = {
        "confirm": "Proceed", # or "next_step" could be here too, depending on common processing order
        "next_step": "Proceed"
    }
    print("\nTest Case: Multiple Common Items, Same Value")
    output_multi_common = flatten_json(multi_common_same_value_input)
    print("Input:", multi_common_same_value_input)
    print("Expected (actual may vary for which common key is kept if values are identical):", multi_common_same_value_expected)
    # We need to check that "action1" is not present, and the common keys are.
    assert "action1" not in output_multi_common
    assert ("confirm" in output_multi_common and output_multi_common["confirm"] == "Proceed")
    assert ("next_step" in output_multi_common and output_multi_common["next_step"] == "Proceed")
    print("Actual:", output_multi_common)
    print("Multiple Common Items, Same Value Test Passed (logic for removal of non-common is key)")


    # Test with original example from previous version to see behavior change
    old_example_input = {
        "navigation": {
            "home": "Home",
            "exercises": "Exercises"
        },
        "home": {
            "title": "Workout Tracker",
            "save": "Save Action" # Different from common.save
        },
        "common": {
            "save": "Save Common", # Different from home.save
            "cancel": "Cancel Common"
        }
    }
    # common.save -> final_result["save"] = "Save Common", value_map["Save Common"] = "save"
    # common.cancel -> final_result["cancel"] = "Cancel Common", value_map["Cancel Common"] = "cancel"
    # navigation.home -> value "Home" not in map. final_result["navigation.home"] = "Home"
    # navigation.exercises -> value "Exercises" not in map. final_result["navigation.exercises"] = "Exercises"
    # home.title -> value "Workout Tracker" not in map. final_result["home.title"] = "Workout Tracker"
    # home.save -> value "Save Action". Not in map. final_result["home.save"] = "Save Action"
    old_example_expected_new_logic = {
        "navigation.home": "Home",
        "navigation.exercises": "Exercises",
        "home.title": "Workout Tracker",
        "home.save": "Save Action", # Kept because "Save Action" is not "Save Common"
        "save": "Save Common",      # This is common.save's key
        "cancel": "Cancel Common"
    }
    print("\nTest Case: Old Example with New Logic")
    output_old_example = flatten_json(old_example_input)
    print("Input:", old_example_input)
    print("Expected:", old_example_expected_new_logic)
    print("Actual:", output_old_example)
    assert output_old_example == old_example_expected_new_logic, "Old Example with New Logic Test Failed"

    print("\nAll new logic tests seem to pass based on interpretation.")

pass
