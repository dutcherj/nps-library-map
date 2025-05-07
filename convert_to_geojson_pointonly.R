
library(jsonlite)

data_dir <- "D:/Downloads/nps-library-map-master.5.06 Archive 10k Samples/reports"

json_files <- list.files(data_dir, "\\.json$", full.names = TRUE)
features   <- list()

for (f in json_files) {
  
  raw  <- readLines(f, warn = FALSE)
  
  # Handle JSON‑lines or a single JSON array
  recs <- tryCatch(fromJSON(paste(raw, collapse = "\n"), simplifyVector = FALSE),
                   error = function(e) NULL)
  if (is.null(recs)) recs <- lapply(raw, fromJSON, simplifyVector = FALSE)
  if (!is.list(recs[[1]]))
    recs <- lapply(seq_len(nrow(recs)), function(i) as.list(recs[i, ]))
  
  for (rec in recs) {
    
    # ── pull numbers out of long_lat_display, fall back to long_lat ──────────
    nums <- as.numeric(unlist(
      strsplit(paste(rec$long_lat_display, collapse = " "), "\\s+")
    ))
    nums <- nums[!is.na(nums)]
    
    if (length(nums) == 0 &&
        length(rec$long_lat) > 0 && nzchar(rec$long_lat[1])) {
      nums <- as.numeric(
        regmatches(rec$long_lat,
                   gregexpr("-?\\d+\\.?\\d*", rec$long_lat, perl = TRUE))[[1]]
      )
      nums <- nums[!is.na(nums)]
    }
    
    # need an even number of values; otherwise skip
    if (length(nums) < 2 || length(nums) %% 2 != 0) next
    
    # ── split into lon/lat pairs, drop dups, flip to [lat, lon] ─────────────
    pairs <- matrix(nums, ncol = 2, byrow = TRUE)             # [lon, lat]
    pairs <- unique(pairs)                                    # kill dup rows
    pairs <- pairs[, c(2, 1), drop = FALSE]                   # → [lat, lon]
    
    geom <- if (nrow(pairs) == 1) {
      list(type = "Point", coordinates = as.numeric(pairs[1, ]))
    } else {
      list(type = "MultiPoint",
           coordinates = lapply(seq_len(nrow(pairs)),
                                function(i) as.numeric(pairs[i, ])))
    }
    
    # ── keep *all* metadata in properties -----------------------------------
    exclude <- c("long_lat", "long_lat_display")
    
    props <- rec[ setdiff(names(rec), exclude) ]    # drop those keys
    
    ## ---- rename title → Title  and  url → Link ---------------------------
    if (!is.null(props$title)) {
      props$Title <- props$title
      props$title <- NULL
    }
    if (!is.null(props$url)) {
      props$Link  <- props$url
      props$url   <- NULL
    }
    
    features[[length(features) + 1L]] <- list(
      type       = "Feature",
      properties = props,
      geometry   = geom
    )
  }
}

geojson <- list(type = "FeatureCollection", features = features)
writeLines(toJSON(geojson, auto_unbox = TRUE, pretty = TRUE),
           "sample-data.geojson")

cat("Completed! Wrote", length(features), "features to combined-data.geojson\n")
