package main

import "fmt";
import "net/http";
import "io";

func main() {
    fmt.Println("hello, world")
	// /images/1.jpg -> 1.jpg
	// images/1.jpg
	http.Handle("/game/", http.StripPrefix("/game/", http.FileServer(http.Dir("game"))))
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	
	io.WriteString(w, "mri")
}