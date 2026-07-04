import argparse
import random
import uuid
import pandas as pd
import os

def generate_contacts(count: int, output_file: str):
    print(f"Generating {count} contacts...")
    
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
    companies = ["Acme Corp", "Globex", "Soylent", "Initech", "Umbrella Corp", "Massive Dynamic", "Stark Industries", "Wayne Enterprises", "Cyberdyne"]
    titles = ["CEO", "CTO", "Manager", "Developer", "Designer", "Director", "VP", "Analyst", "Consultant", "Engineer"]
    
    data = []
    
    for _ in range(count):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        unique_suffix = str(uuid.uuid4())[:8]
        
        row = {
            "name": f"{fn} {ln}",
            "email": f"{fn.lower()}.{ln.lower()}.{unique_suffix}@example.com",
            "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "company": random.choice(companies),
            "job_title": random.choice(titles),
            "city": random.choice(cities)
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)
    print(f"Successfully wrote {count} contacts to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate dummy contacts for benchmarking")
    parser.add_argument("--count", type=int, default=10000, help="Number of contacts to generate")
    parser.add_argument("--output", type=str, default="data/benchmark_contacts.csv", help="Output file path")
    
    args = parser.parse_args()
    generate_contacts(args.count, args.output)
