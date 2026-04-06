import pandas as pd
import os

print("🔥 Combining CICIDS PARQUET datasets...\n")

folder_path = "data/cicids"

if not os.path.exists(folder_path):
    print("❌ Folder not found:", folder_path)
    exit()

all_files = [f for f in os.listdir(folder_path) if f.endswith(".parquet")]

print(f"📁 Found {len(all_files)} parquet files\n")

if not all_files:
    print("❌ No parquet files found!")
    exit()

df_list = []

for file in all_files:
    path = os.path.join(folder_path, file)
    print(f"📂 Loading: {file}")
    
    df = pd.read_parquet(path)
    df_list.append(df)

print("\n🔗 Combining all files...")
combined_df = pd.concat(df_list, ignore_index=True)

print("🧹 Cleaning data...")

combined_df.replace([float('inf'), float('-inf')], pd.NA, inplace=True)
combined_df.dropna(inplace=True)

print("🏷 Creating labels...")

if 'Label' not in combined_df.columns:
    print("❌ 'Label' column not found!")
    print("Columns available:", combined_df.columns)
    exit()

combined_df['label'] = combined_df['Label'].apply(lambda x: 0 if x == 'BENIGN' else 1)

print("💾 Saving combined dataset...")
combined_df.to_csv("data/cicids/combined.csv", index=False)

print("\n✅ SUCCESS: combined.csv created!")