import json

# Load the JSON file
print("Opening the JSON file...")
try:
    with open('movies.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    print("JSON file loaded successfully.")
except FileNotFoundError:
    print("Error: The file 'movies.json' was not found.")
    exit()
except json.JSONDecodeError:
    print("Error: The file 'movies.json' is not a valid JSON file.")
    exit()

# Print all entries and highlight non-ASCII characters
for movie in data:
    if any(char for char in movie.get('Title', '') if ord(char) > 127) or \
       any(char for char in movie.get('Director', '') if ord(char) > 127) or \
       any(char for char in movie.get('Cast', '') if ord(char) > 127):
        print(f"Problematic Entry: {movie}")
    else:
        print(f"Entry: {movie}")

print("Process completed.")
