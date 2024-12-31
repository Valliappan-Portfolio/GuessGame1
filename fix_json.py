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

# Define a function to fix the keys and cleanse data
def cleanse_text(text):
    if text is None:
        return ""
    return text.replace('�', '')

def fix_keys(movie):
    fixed_movie = {}
    fixed_movie['title'] = cleanse_text(str(movie.get('title', '')))
    fixed_movie['director'] = cleanse_text(str(movie.get('director', '')))
    fixed_movie['cast'] = cleanse_text(str(movie.get('cast', '')))
    fixed_movie['year'] = movie.get('year')
    print(f"Original: {movie}\nFixed: {fixed_movie}\n")  # Debug output
    return fixed_movie

# Apply the function to all movies
print("Fixing the JSON keys and cleansing data...")
fixed_data = [fix_keys(movie) for movie in data]
print("JSON keys fixed and data cleansed successfully.")

# Save the fixed JSON back to the file
try:
    with open('movies_fixed.json', 'w', encoding='utf-8') as file:
        json.dump(fixed_data, file, ensure_ascii=False, indent=4)
    print("Fixed JSON saved to 'movies_fixed.json'.")
except IOError:
    print("Error: Could not write to 'movies_fixed.json'.")

print("Process completed.")
