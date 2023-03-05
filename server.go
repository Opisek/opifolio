package main

import (
	"html/template"
	"net/http"
)

func main() {
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("public/css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("public/js"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("public/images"))))

	t := template.Must(template.ParseGlob("./public/html/*.html"))
	template.Must(t.ParseGlob("./public/partials/*.html")) // i don't like that this can be viewed e.g. opisek.net/commonHead

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path[1:] + ".html"
		if path == ".html" {
			path = "index.html"
		}
		if t.ExecuteTemplate(w, path, nil) != nil {
			t.ExecuteTemplate(w, "404.html", nil)
		}
	})

	http.ListenAndServe(":8080", nil)
}
