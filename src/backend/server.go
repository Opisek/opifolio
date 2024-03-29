package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
)

//
// Data Types
//

type Redirect struct {
	Pages []string
	Url   string
}

//
// Main
//

func main() {
	// get data we need
	htmlFilesMap := getHtmlFilesMap()
	redirectsMap := getRedirectsMap()

	// handle static resources
	oneYear := 60 * 60 * 24 * 365
	http.Handle("/css/", handleCache(oneYear, handleCompression("text/css", http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))))))
	http.Handle("/js/", handleCache(oneYear, handleCompression("text/javascript", http.StripPrefix("/js/", http.FileServer(http.Dir("public/js"))))))
	http.Handle("/images/", handleCache(oneYear, http.StripPrefix("/images/", http.FileServer(http.Dir("public/images")))))

	// handle views and redirects
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { handleView(w, r, &htmlFilesMap, &redirectsMap) })

	// start the server
	fmt.Println("Listening on port " + os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}

//
// Data Loader
//

func getHtmlFilesMap() map[string]bool {
	htmlFiles, err := os.ReadDir("public/html")
	if err != nil {
		panic(err)
	}

	htmlFilesMap := map[string]bool{}
	for _, file := range htmlFiles {
		htmlFilesMap[file.Name()] = true
	}

	return htmlFilesMap
}

func getRedirectsMap() map[string]string {
	redirectsJson, err := os.ReadFile("config/redirects.json")
	if err != nil {
		panic(err)
	}

	var redirectsArray []Redirect
	err = json.Unmarshal([]byte(redirectsJson), &redirectsArray)
	if err != nil {
		panic(err)
	}

	redirectsMap := map[string]string{}
	for _, redirect := range redirectsArray {
		for _, page := range redirect.Pages {
			redirectsMap[page] = redirect.Url
		}
	}

	return redirectsMap
}

//
// Compression Determination
//

func getCompressionType(r *http.Request) string {
	return "gzip"
}

func supportsCompression(r *http.Request) bool {
	return strings.Contains(r.Header.Get("Accept-Encoding"), getCompressionType(r))
}

func getCompressedExtension(r *http.Request) string {
	if supportsCompression(r) {
		return ".gz"
	} else {
		return ""
	}
}

//
// File Handling
//

func handleCache(seconds int, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// set matching compression encoding
		w.Header().Set("Cache-Control", "public, max-age="+fmt.Sprint(seconds))

		// forward request to the next handler in the chain
		h.ServeHTTP(w, r)
	})
}

func handleCompression(contentType string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// if no encoding is supported, immediatel forward to the next handler
		if !supportsCompression(r) {
			h.ServeHTTP(w, r)
			return
		}

		// add the compression extension to the path
		r2 := new(http.Request)
		*r2 = *r
		r2.URL = new(url.URL)
		*r2.URL = *r.URL
		r2.URL.Path = r.URL.Path + getCompressedExtension(r)

		// set matching compression encoding
		w.Header().Set("Content-Encoding", getCompressionType(r))
		w.Header().Set("Content-Type", contentType)

		// forward request to the next handler in the chain
		h.ServeHTTP(w, r2)
	})
}

func handleView(w http.ResponseWriter, r *http.Request, htmlFilesMap *map[string]bool, redirectsMap *map[string]string) {
	// get the requested filename
	path := r.URL.Path[1:]
	if path == "" {
		path = "index"
	}

	if !(*htmlFilesMap)[path+".html"] {
		// if no such page exists, check if there is a matching redirect
		split := strings.Split(r.URL.Path[1:], "/")
		url, exists := (*redirectsMap)[split[0]]
		if exists {
			if len(split) != 1 {
				url += "/" + r.URL.Path[len(split[0])+2:]
			}
			http.Redirect(w, r, url, http.StatusPermanentRedirect)
			return
		} else {
			// if no matching redirect exists either, show the 404 page
			path = "404"
		}
	}

	// finally, send a file if the user had not been redirected
	if supportsCompression(r) {
		w.Header().Set("Content-Encoding", getCompressionType(r))
		w.Header().Set("Content-Type", "text/html")
	}
	http.ServeFile(w, r, "public/html/"+path+".html"+getCompressedExtension(r))
}
