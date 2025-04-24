#install.packages("jsonlite")
library(jsonlite)

lines <- readLines("sample.txt")
features <- list()

for (ln in lines) {
    rec ,_ fromJSON(ln)

    nums <- as.numeric(unlist(strsplit(psate(rec$long_lat_display, collapse = " "), "\\s+")))
    nums <- nums[!is.na(nums)]

    if (length(nums) == 2) { # Point
        geom <- list(
            type = "Point",
            coordinates = nums
        )

    } else if (length(nums) %% 4 == 0 && length(nums) > 0) { # One or Multiple Bounding Boxes
        boxes <- split(nums, ceiling(seq_along(nums) / 4))
        ring <- function(w, e, s, n) list( list(c(w, s), c(w, n), c(e, n), c(e, s), c(w, s)) )
        
        if (length(boxes) == 1) { 
            w <- boxes[[1]][1]; e <- boxes[[1]][2]; s <- boxes [[1]][3]; n < boxes[[1]][4]
            geom <- list(type = "Polygon",  coordinates = ring(w, e, s, n))
        } else {
            geom <- list(
                type    = "MultiPolygon",
                coordinates = lapply(boxes, function(b) ring(b[1], b[2], b[3], b[4]))
            )
        }
    } else next

    # Build the feature
    feature[[length(features)+1]] <- list(
        type    = "Feature",
        properties = list(
            Title = rec$title,Link = rec$url
        ),
        geometry    = geom
    )
}

geojson <- list(type = "FeatureCollection", features = features)
writeLines(toJSON(geojson, auto_unbox = TRUE, pretty = TRUE), "sample-data.geojson")

cat( "\nCompleted!\n Wrote", length(features), "features to sample-data.geojson\n")