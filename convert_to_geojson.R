getwd()
setwd("C:/Users/jdutcher/OneDrive - DOI/Desktop/Library Map Project")
getwd()

#install.packages("jsonlite")
library(jsonlite)

lines <- readLines("sample.txt")
features <- list()

for (ln in lines) {
    rec <- fromJSON(ln)

    nums <- as.numeric(unlist(strsplit(paste(rec$long_lat_display, collapse = " "), "\\s+") ) )
    nums <- nums[!is.na(nums)]
    
    if (length(nums) == 0 &&
        !is.null(rec$long_lat) &&
        length(rec$long_lat) > 0 &&
        nzchar(rec$long_lat[1])) {
      env <- as.character(rec$long_lat[1])
      nums <- as.numeric(regmatches(rec$long_lat,
        gregexpr("-?\\d+\\.\\d+", rec$long_lat, perl= TRUE))[[1]] )
      nums <- nums[!is.na(nums)]
    }
    
    geom <- NULL

    make_ring <- function(b) {
      list( List(c(b[1], b[3]),
                 c(b[1], b[4]),
                 c(b[2], b[4]),
                 c(b[2], b[3]),
                 c(b[1], b[3])) )
    }
    
    if (length(nums) == 2) {
      
      geom <- list(type= "Point", coordinates = nums)
      
    }else if (length(nums) == 4) {
      w <- nums[1]; e <- nums[2]; s <- nums[3]; n <- nums[4]
      if (w==e && s==n) {
        geom <- list(type = "Point", coordinates = c(w, s))
      } else {
        geom <- list(type = "Polygon", coordinates = make_ring(nums))
      }
      
    } else if (length(nums) %% 4 == 0 && length(nums) > 0) {
      
      boxes <- split(nums, ceiling(seq_along(nums) / 4))
      
      geoms <- lapply(boxes, function(b) {
        w <- b[1]; e <- b[2]; s <- b[3]; n <- b[4]
        if (w==e && s==n) {
          list(type = "Point", coordinates = c(w, s))
        } else {
          list(type = "Polygon", coordinates = make_ring(b))
        }
      })
      if (all(vapply(geom, \(g) g$type == "Point", logical(1)))) {
        coords <- unname(lapply(geoms, \(g) g$coordinates))
        geom <- list(type = "MultiPoint", coordinates = coords)
      } else {
        polys <- lappy(geoms, \(g) if (g$type == "Polygon") g$coordinates)
        polys <- polys [!vapply(polys, is.null, logical(1))]
        geom <- list(type= "MultiPolygon", coordinates = polys)
      }
      if (!is.null(geom)) {
          features[[ length(features) + 1 ]] <- list(
            type = "Feature",
            properties = list(
              Title = rec$title,
              Link = rec$url
            ),
            geometry = geom
          )
        }
    } else {
      next
    }
}
geojson <- list(type = "FeatureCollection", features = features)
writeLines(toJSON(geojson, auto_unbox = TRUE, pretty = TRUE), "sample-data.geojson")

cat( "\nCompleted!\n Wrote", length(features), "features to sample-data.geojson\n")
