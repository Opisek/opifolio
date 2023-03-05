package main

import (
	"encoding/json"
	"html/template"
	"net/http"
	"os"
	"strings"
)

type Redirect struct {
	Pages []string
	Url   string
}

func main() {
	// static data
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("public/js"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("public/images"))))

	// templates
	t := template.Must(template.ParseGlob("./public/html/*.html"))
	template.Must(t.ParseGlob("./public/partials/*.html")) // i don't like that this can be viewed e.g. opisek.net/commonHead

	// redirects
	redirectsJson, err := os.ReadFile("redirects.json")
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
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path[1:] + ".html"
		if path == ".html" {
			path = "index.html"
		}
		if t.ExecuteTemplate(w, path, nil) != nil {
			split := strings.Split(r.URL.Path[1:], "/")
			url, exists := redirectsMap[split[0]]
			if exists {
				http.Redirect(w, r, url+"/"+r.URL.Path[len(split[0])+2:], http.StatusPermanentRedirect)
			} else {
				t.ExecuteTemplate(w, "404.html", nil)
			}
		}
	})

	http.ListenAndServe(":"+os.Getenv("PORT"), nil)
}
