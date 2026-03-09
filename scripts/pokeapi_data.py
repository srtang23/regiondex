import os
import urllib.request, urllib.error
import json
import pandas as pd

# Create a file directory to store the downloaded sprites if it doesn't exist
os.makedirs("src/assets/sprites", exist_ok=True)
os.makedirs("src/data", exist_ok=True) # For the CSV file that will be created from the dataset

base_url = "https://pokeapi.co/api/v2/generation/1/" # If time permits I can make this include the other gens as well
pokemon_request = urllib.request.Request(base_url,  headers={'User-Agent': 'Mozilla/5.0'})

gen1_dataset = []

try:
    with urllib.request.urlopen(pokemon_request) as response:
        pokemon_data = json.loads(response.read().decode('utf-8'))

    # Remove the [:3] since I am only limiting so we dont get IP banned from PokeAPI for so much API calls, but the dataframe should gives us 151 pokemon with zero index in mind if you remove it
    for pokemon in pokemon_data['pokemon_species']: 
        pokemon_name = pokemon['name']
        pokemon_url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_name}/"

        specific_pokemon_url = urllib.request.Request(pokemon_url,  headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(specific_pokemon_url) as specific_pokemon:
            pokemon_info = json.loads(specific_pokemon.read().decode('utf-8'))

            # Sprite Downloader
            sprite_url = pokemon_info['sprites']['front_default']
            if sprite_url:
                sprite_path = f"assets/sprites/{pokemon_name}.png"
                urllib.request.urlretrieve(sprite_url, sprite_path)

            # Extracting stats and creating the dataset
            pokemon_stats = {stat['stat']['name']: stat['base_stat'] for stat in pokemon_info['stats']} #Can be written as a for loop with this integrated inside
            gen1_dataset.append({
                'ID': pokemon_info['id'],
                'Name': pokemon_name,
                'HP': pokemon_stats['hp'],
                'Attack': pokemon_stats['attack'],
                'Defense': pokemon_stats['defense'],
                'SP. Atk': pokemon_stats['special-attack'],
                'SP. Def': pokemon_stats['special-defense'],
                'Speed': pokemon_stats['speed']
            })

except urllib.error.HTTPError as error:
    print("An unexpected error occurred:\nError code: {}".format(error.code))
except urllib.error.URLError as error:
    print("The server couldn't fulfill the request.\nReason: {} ".format(error.reason))

pokemon_stats_df = pd.DataFrame(gen1_dataset)
pokemon_stats_df = pokemon_stats_df.sort_values('ID').set_index('ID')

pokemon_stats_df.to_csv('data/pokemon_stats.csv') # Save the dataset as a CSV file
print(f"Successfully saved the dataset of {len(pokemon_stats_df)} Pokémon to 'data/pokemon_stats.csv', and the sprites to 'assets/sprites/' directory.")
print(pokemon_stats_df.head())