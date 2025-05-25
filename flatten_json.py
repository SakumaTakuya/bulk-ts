import copy

def flatten_json(data):
    """
    Flattens a JSON object according to specific rules.

    Args:
        data: A Python dictionary representing the JSON object to flatten.

    Returns:
        A new Python dictionary representing the flattened JSON object.
    """
    result = {}
    
    # Deepcopy to avoid modifying the original dictionary if it's mutable (like a dict)
    # and used elsewhere. For this problem, data.pop would have been an issue.
    input_data = copy.deepcopy(data)

    def _flatten_recursive(current_data, current_prefix, is_processing_common_children):
        if not isinstance(current_data, dict):
            # This case handles if a value within common is not a dict but is processed recursively
            # However, the main loop iterates items, so value is handled by the else block.
            # This path in _flatten_recursive might not be hit if current_data is always a dict.
            return

        for key, value in current_data.items():
            if is_processing_common_children:
                # For children of 'common', or nested children within 'common'
                if current_prefix: # This means we are inside a nested dict within 'common'
                    new_key = f"{current_prefix}.{key}"
                else: # Direct child of 'common'
                    new_key = key
            else:
                # For non-'common' items or 'common' key itself before special handling
                if current_prefix:
                    new_key = f"{current_prefix}.{key}"
                else:
                    new_key = key

            if isinstance(value, dict):
                _flatten_recursive(value, new_key, is_processing_common_children)
            else:
                # Rule 4: Prioritization is handled by processing common items last and allowing overwrite.
                result[new_key] = value

    # Separate common data and process other data first
    common_data = input_data.pop('common', None) # Safely pop 'common'
    
    # Process all other items first
    _flatten_recursive(input_data, "", is_processing_common_children=False)

    # Process 'common' items last to ensure they overwrite if conflicts occur at the root
    if common_data is not None and isinstance(common_data, dict):
        _flatten_recursive(common_data, "", is_processing_common_children=True)
        
    return result

if __name__ == '__main__':
    example_input = {
        "navigation": {
            "home": "Home",
            "exercises": "Exercises"
        },
        "home": {
            "title": "Workout Tracker",
            "save": "Save Action"
        },
        "common": {
            "save": "Save Common",
            "cancel": "Cancel Common"
        }
    }

    expected_output = {
        "navigation.home": "Home",
        "navigation.exercises": "Exercises",
        "home.title": "Workout Tracker",
        "home.save": "Save Action",
        "save": "Save Common",
        "cancel": "Cancel Common"
    }

    output = flatten_json(example_input)
    print("Input:")
    # Print a fresh copy for clarity as input_data is modified by pop
    fresh_example_input = {
        "navigation": {
            "home": "Home",
            "exercises": "Exercises"
        },
        "home": {
            "title": "Workout Tracker",
            "save": "Save Action"
        },
        "common": {
            "save": "Save Common",
            "cancel": "Cancel Common"
        }
    }
    print(fresh_example_input)
    print("\nExpected Output:")
    print(expected_output)
    print("\nActual Output:")
    print(output)
    assert output == expected_output, "Test Case 1 Failed"
    print("-" * 20)

    # Test case for Rule 4: Prioritization
    conflict_input = {
        "save": "Save from root", # This key will conflict with common.save
        "common": {
            "save": "Save Common" # This should win
        },
        "user": {
            "name": "User1"
        }
    }
    expected_conflict_output = {
        "save": "Save Common",      # Prioritized from common
        "user.name": "User1"
    }
    print("Conflict Test Input (Root vs Common):")
    print(conflict_input)
    output_conflict = flatten_json(conflict_input)
    print("\nExpected Conflict Output:")
    print(expected_conflict_output)
    print("\nActual Conflict Output:")
    print(output_conflict)
    assert output_conflict == expected_conflict_output, "Test Case 2 Failed (Root vs Common)"
    print("-" * 20)

    # Test case from description: {"common": {"foo": "bar"}, "baz": {"foo": "qux"}}
    desc_example_input = {
        "common": {"foo": "bar"},
        "baz": {"foo": "qux"}
    }
    desc_expected_output = {
        "foo": "bar",
        "baz.foo": "qux"
    }
    print("Description Example Input:")
    print(desc_example_input)
    output_desc_example = flatten_json(desc_example_input)
    print("\nExpected Description Example Output:")
    print(desc_expected_output)
    print("\nActual Description Example Output:")
    print(output_desc_example)
    assert output_desc_example == desc_expected_output, "Test Case 3 Failed (Description Example)"
    print("-" * 20)

    # Test with empty common
    empty_common_input = {
        "common": {},
        "home": {"title": "Welcome"}
    }
    empty_common_expected = {
        "home.title": "Welcome"
    }
    print("Empty Common Input:")
    print(empty_common_input)
    output_empty_common = flatten_json(empty_common_input)
    print("\nExpected Empty Common Output:")
    print(empty_common_expected)
    print("\nActual Empty Common Output:")
    print(output_empty_common)
    assert output_empty_common == empty_common_expected, "Test Case 4 Failed (Empty Common)"
    print("-" * 20)

    # Test with no common key
    no_common_input = {
        "user": {"name": "John", "settings": {"theme": "dark"}}
    }
    no_common_expected = {
        "user.name": "John",
        "user.settings.theme": "dark"
    }
    print("No Common Input:")
    print(no_common_input)
    output_no_common = flatten_json(no_common_input)
    print("\nExpected No Common Output:")
    print(no_common_expected)
    print("\nActual No Common Output:")
    print(output_no_common)
    assert output_no_common == no_common_expected, "Test Case 5 Failed (No Common)"
    print("-" * 20)

    # Test with deeper nesting in common
    deep_nest_input = {
        "a": {
            "b": {
                "c": "d"
            },
            "e": "f"
        },
        "common": {
            "g": "h",  # Becomes "g": "h"
            "i": {     # Becomes "i.j": "k"
                "j": "k"
            },
            "l": "m"   # Becomes "l": "m"
        }
    }
    deep_nest_expected = {
        "a.b.c": "d",
        "a.e": "f",
        "g": "h",
        "i.j": "k", # Correctly flattened from common's nested structure
        "l": "m"
    }
    print("Deep Nest Input (including common):")
    print(deep_nest_input)
    output_deep_nest = flatten_json(deep_nest_input)
    print("\nExpected Deep Nest Output:")
    print(deep_nest_expected)
    print("\nActual Deep Nest Output:")
    print(output_deep_nest)
    assert output_deep_nest == deep_nest_expected, "Test Case 6 Failed (Deep Nest)"
    print("-" * 20)

    # Test with common items that are not dictionaries (should be rare, but good to test)
    # The problem implies 'common' is an object/dictionary.
    # If common contains non-dict values directly, they are treated as simple types.
    common_with_simple_types_input = {
        "common": {
            "name": "App Name",
            "version": 1.0
        },
        "version": 0.9 # This should be overwritten by common.version
    }
    common_with_simple_types_expected = {
        "name": "App Name",
        "version": 1.0
    }
    print("Common with simple types input:")
    print(common_with_simple_types_input)
    output_common_simple = flatten_json(common_with_simple_types_input)
    print("\nExpected common with simple types output:")
    print(common_with_simple_types_expected)
    print("\nActual common with simple types output:")
    print(output_common_simple)
    assert output_common_simple == common_with_simple_types_expected, "Test Case 7 Failed (Common with Simple Types)"
    print("-" * 20)

    print("All tests seem to pass with the current logic.")
    print("The key is `is_processing_common_children` flag and the order of operations (non-common then common).")
    print("When `is_processing_common_children` is true, the `current_prefix` for the recursive call starts empty,")
    print("and then builds up *within* common's structure if it's nested (e.g., common.i.j becomes i.j).")
    print("When `is_processing_common_children` is false, `current_prefix` builds up normally (e.g. user.settings.theme).")

pass
