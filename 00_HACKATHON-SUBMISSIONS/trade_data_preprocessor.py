"""
Trade Data Monthly Delta Extractor
----------------------------------
This script processes cumulative international trade datasets (e.g., import/export records)
to extract specific periodic data (e.g., monthly activities) by calculating the delta 
between two cumulative reporting periods.

It handles common data inconsistencies such as messy column headers, missing values, 
and string-formatted numerical data, ensuring the output is clean and ready for ML/AI pipelines.
"""

import pandas as pd
import sys

# ================= Configuration =================
# Define file paths for the current and previous cumulative periods
FILE_PREVIOUS_PERIOD = "import_data_previous.xlsx"
FILE_CURRENT_PERIOD = "import_data_current.xlsx"
OUTPUT_FILE = "import_data_periodic_delta.xlsx"

# Core identifier columns for grouping and merging
KEYS = ["Tariff_Code", "Country", "Customs_Office"]

# Numerical columns to calculate the delta
VALUE_COLS = ["Weight_KG", "Value_Local_Currency", "Value_USD"]
# =================================================

def clean_column_name(col_name):
    """
    Strips extra whitespace from column names to ensure consistent mapping.
    """
    return str(col_name).strip()


def load_and_normalize(path):
    print(f"Reading file: {path} ...")
    try:
        df = pd.read_excel(path)
        # Store original column names to preserve the exact format in the final output
        original_cols = df.columns.tolist()

        # Standardize all column names
        df.columns = [clean_column_name(c) for c in df.columns]

        # Convert numerical columns from string/mixed formats to float
        for v in VALUE_COLS:
            if v in df.columns:
                df[v] = (df[v].astype(str)
                         .str.replace(",", "")
                         .str.replace(" ", "")
                         .replace("nan", "0")
                         .replace("None", "0")
                         .astype(float))
            else:
                print(f"❌ Error: Column '{v}' not found in {path}!")
                print(f"Available columns: {df.columns.tolist()}")
                sys.exit(1)

        return df, original_cols

    except Exception as e:
        print(f"❌ Error processing file {path}: {e}")
        sys.exit(1)


# --- Main Execution ---

# 1. Load and normalize both datasets
df_current, orig_cols_current = load_and_normalize(FILE_CURRENT_PERIOD)
df_prev, _ = load_and_normalize(FILE_PREVIOUS_PERIOD)

# 2. Retain categorical/metadata columns from the current period
other_cols = [c for c in df_current.columns if c not in KEYS and c not in VALUE_COLS]

agg_rules = {col: "sum" for col in VALUE_COLS}
for col in other_cols:
    agg_rules[col] = "first"

print("Aggregating data via GroupBy...")
g_current = df_current.groupby(KEYS, dropna=False).agg(agg_rules).reset_index()
g_prev = df_prev.groupby(KEYS, dropna=False)[VALUE_COLS].sum().reset_index()

print("Calculating periodic delta (Current - Previous)...")
# Merge the two datasets based on the identifier keys
merged = pd.merge(g_current, g_prev, on=KEYS, how="left", suffixes=("", "_prev"))

# Perform subtraction to find the exact activity for the specific period
for col in VALUE_COLS:
    col_prev = f"{col}_prev"
    merged[col_prev] = merged[col_prev].fillna(0)
    merged[col] = merged[col].fillna(0)

    # Core calculation
    merged[col] = merged[col] - merged[col_prev]

# Filter out rows with zero activity in the current period
condition = (merged[VALUE_COLS[0]] != 0) | \
            (merged[VALUE_COLS[1]] != 0) | \
            (merged[VALUE_COLS[2]] != 0)

final_df = merged[condition].copy()

# Restore original column names and order
final_df = final_df[df_current.columns]
rename_map = dict(zip(df_current.columns, orig_cols_current))
final_df = final_df.rename(columns=rename_map)

# Export the cleaned data
final_df.to_excel(OUTPUT_FILE, index=False)
print(f"✅ Calculation complete. Data saved to: {OUTPUT_FILE}")
