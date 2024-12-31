import json

# Single movie entry for testing
data = [
  {
    "title": "Vaagai",
    "director": "Ram Sevaa",
    "cast": "Ramakrishnan, Tarushi Jha,�Pattimandram Raja,�Sujatha Sivakumar",
    "year": 2024
  }
]

# Define a function to fix the keys and cleanse data
def cleanse_text(text):
    if text is None:
        return ""
    return text.replace('�', '')

def fix_keys(movie):
    fixed_movie = {}
    fixed_movie['title'] = cleanse_text(movie.get('title', ''))
    fixed_movie['director'] = cleanse_text(movie.get('director', ''))
    fixed_movie['cast'] = cleanse_text(movie.get('cast', ''))
    fixed_movie['year'] = movie.get('year')
    print(f"Original: {movie}\nFixed: {fixed_movie}\n")  # Debug output
    return fixed_movie

# Apply the function to the single movie entry
print("Fixing the JSON keys and cleansing data for a single entry...")
fixed_data = [fix_keys(movie) for movie in data]
print("Single entry fixed successfully.")

# Save the fixed JSON back to the file for testing
try:
    with open('single_entry_fixed.json', 'w', encoding='utf-8') as file:
        json.dump(fixed_data, file, ensure_ascii=False, indent=4)
    print("Fixed JSON saved to 'single_entry_fixed.json'.")
except IOError:
    print("Error: Could not write to 'single_entry_fixed.json'.")

print("Process completed.")
