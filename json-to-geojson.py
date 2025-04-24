import json, re

features = []

for line in open("sample.txt"):
    rec = json.loads(line)

    # Grab all numbers in long_lat_display
    nums = list(map(float,
                re.findall(r"-?\d+\.\d+", " ".join(rec.get("long_lat_display", [])))))
    
    if not nums:
        continue

    # Geometry

    if len(nums) == 2: # Point
        lon, lat = map(float, nums)
        geom = {"type": "Point", "coordinates": [lon, lat]}
    
    elif len(nums) % 4 == 0: # One or more bounding boxes
        boxes = [nums[i:i+4] for i in range (0, len(nums), 4)] # [w,e,s,n]
        rings = lambda w,e,s,n: [[w, s], [w, n], [e, n], [e, s], [w, s]]

        if len(boxes) == 1: # Single box
            w,e,s,n = boxes[0]
            geom = {"type": "Polygon",
                    "coordinates": [rings(w,e,s,n)]}
        
        else:
            geom = {"type": "Polygon",
                    "coordinates": [ [rings(w,e,s,n)] for w,e,s,n in boxes ]}
    
    else:
        continue

    features.append({
        "type": "Feature",
        "properties": {
            "Title": rec.get("title", ""),
            "Link": rec.get("url",  "")
        },
        "geometry": geom
    })

# Write GeoJSON
json.dump({"type": "FeatureCollection", "features": features},
          open("sample-data.geojson", "w"), indent=2)

print(f"Converted {len(features)} records ")