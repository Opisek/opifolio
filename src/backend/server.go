package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type Redirect struct {
	Pages []string
	Url   string
}

func main() {
	// get html files so we can determine 404 without expensive disk reads
	files, err := os.ReadDir("public")
	if err != nil {
		panic(err)
	}
	htmlFiles := map[string]bool{}
	for _, file := range files {
		fileName := file.Name()
		extension := fileName[(strings.LastIndex(fileName, ".") + 1):]
		if extension == "html" {
			htmlFiles[fileName] = true
		}
	}

	// static data
	//http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))))
	//http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("public/js"))))
	//http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("public/images"))))

	// redirects
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

	// page handling
	http.Handle("/", http.FileServer(http.Dir("public")))

	// page handling
	/*http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path[1:] + ".html"
		if path == ".html" {
			path = "index.html"
		}
		if t.ExecuteTemplate(w, path, nil) != nil {
			split := strings.Split(r.URL.Path[1:], "/")
			url, exists := redirectsMap[split[0]]
			if exists {
				if len(split) != 1 {
					url += "/" + r.URL.Path[len(split[0])+2:]
				}
				http.Redirect(w, r, url, http.StatusPermanentRedirect)
			} else {
				t.ExecuteTemplate(w, "404.html", nil)
			}
		}
	})*/

	fmt.Println("Listening on port " + os.Getenv("PORT"))
	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
