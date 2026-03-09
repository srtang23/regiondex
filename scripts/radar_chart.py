import os
import pandas as pd
import altair as alt
import numpy as np

def generate_all_charts():
    # Make sure the charts directory exists
    # Assuming this script is inside a 'scripts' folder, we go up one level then into src
    os.makedirs("../src/assets/charts", exist_ok=True) 
    
    # 1. Load your exact CSV!
    df = pd.read_csv('../src/data/pokemon_stats.csv')

    STATS = ['HP', 'Attack', 'Defense', 'SP. Atk', 'SP. Def', 'Speed']
    
    # 2. Calculate the Global Max scaling ON THE FLY!
    # This divides every stat by the absolute highest stat in Gen 1 so unevolved pokemon look smaller
    SCALE_COLS = []
    for stat in STATS:
        max_val = df[stat].max()
        scaled_col_name = f"{stat}_scaled"
        df[scaled_col_name] = df[stat] / max_val
        SCALE_COLS.append(scaled_col_name)
    
    RING_COUNT = 5 
    CHART_SIZE = 200 # Fits nicely in the modal
    n = len(STATS)

    def stat_angle(i):
        return np.pi / 2 - 2 * np.pi * i / n
    def polar_to_xy(r, angle):
        return r * np.cos(angle), r * np.sin(angle)

    # Pre-calculate spokes and rings (they are the same for every Pokemon)
    spoke_rows = [{"x": 0.0, "y": 0.0, "group": stat} for stat in STATS] + \
                 [{"x": polar_to_xy(1.0, stat_angle(i))[0], "y": polar_to_xy(1.0, stat_angle(i))[1], "group": stat} for i, stat in enumerate(STATS)]
    spokes_df = pd.DataFrame(spoke_rows)

    ring_rows = [{"x": (ring/RING_COUNT) * np.cos(2 * np.pi * j / 360), "y": (ring/RING_COUNT) * np.sin(2 * np.pi * j / 360), "ring": ring, "order": j} 
                 for ring in range(1, RING_COUNT + 1) for j in range(361)]
    rings_df = pd.DataFrame(ring_rows)

    DOMAIN = [-1.4, 1.4]
    x_scale = alt.Scale(domain=DOMAIN)
    y_scale = alt.Scale(domain=DOMAIN)
    
    rings_chart = alt.Chart(rings_df).mark_line(color="#e2e8f0", strokeWidth=1).encode(x=alt.X("x:Q", scale=x_scale, axis=None), y=alt.Y("y:Q", scale=y_scale, axis=None), detail="ring:N", order="order:Q")
    spokes_chart = alt.Chart(spokes_df).mark_line(color="#cbd5e1", strokeWidth=1).encode(x=alt.X("x:Q", scale=x_scale, axis=None), y=alt.Y("y:Q", scale=y_scale, axis=None), detail="group:N", order=alt.Order("x:Q"))

    # 3. Loop through every Pokemon and generate the chart
    for index, row in df.iterrows():
        pokemon_name = row['Name']
        
        # Build the stat polygon using the SCALED values, but keep the REAL values for the tooltip
        stat_rows = [{"x": polar_to_xy(row[scale_col], stat_angle(i))[0], 
                      "y": polar_to_xy(row[scale_col], stat_angle(i))[1], 
                      "order": i, "stat": stat, "value": row[stat]} 
                     for i, (stat, scale_col) in enumerate(zip(STATS, SCALE_COLS))]
        stat_rows.append({**stat_rows[0], "order": n})
        stat_df = pd.DataFrame(stat_rows)

        # Build Labels
        label_rows = [{"x": polar_to_xy(1.25, stat_angle(i))[0], "y": polar_to_xy(1.25, stat_angle(i))[1], 
                       "label": stat, "value": row[stat]} for i, stat in enumerate(STATS)]
        labels_df = pd.DataFrame(label_rows)

        stat_line = alt.Chart(stat_df).mark_line(color="#E07451", strokeWidth=2.5).encode(x=alt.X("x:Q", scale=x_scale, axis=None), y=alt.Y("y:Q", scale=y_scale, axis=None), order="order:Q", tooltip=[alt.Tooltip("stat:N", title="Stat"), alt.Tooltip("value:Q", title="Value")])
        stat_points = alt.Chart(stat_df[:-1]).mark_point(color="#E07451", size=60, filled=True, opacity=1.0).encode(x=alt.X("x:Q", scale=x_scale, axis=None), y=alt.Y("y:Q", scale=y_scale, axis=None), tooltip=[alt.Tooltip("stat:N", title="Stat"), alt.Tooltip("value:Q", title="Value")])
        
        labels_chart = alt.Chart(labels_df).mark_text(fontSize=11, fontWeight="bold", color="#475569").encode(x=alt.X("x:Q", scale=x_scale, axis=None), y=alt.Y("y:Q", scale=y_scale, axis=None), text=alt.Text("label:N"), tooltip=[alt.Tooltip("label:N", title="Stat"), alt.Tooltip("value:Q", title="Value")])

        chart = alt.layer(rings_chart, spokes_chart, stat_line, stat_points, labels_chart).properties(
            width=CHART_SIZE, height=CHART_SIZE, 
            title=alt.TitleParams(text=f"{pokemon_name.capitalize()} Base Stats", fontSize=14, fontWeight="bold", anchor="middle", offset=10)
        ).configure_view(strokeWidth=0)

        # 4. Save to the correct folder
        file_name = pokemon_name.lower().replace('♀', '-f').replace('♂', '-m').replace(' ', '-').replace("'", "").replace(".", "")
        chart_path = f"../src/assets/charts/{file_name}_chart.json"
        
        chart.save(chart_path)
    
    print(f"Successfully generated {len(df)} radar charts into src/assets/charts!")

if __name__ == "__main__":
    generate_all_charts()