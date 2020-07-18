package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
)

var mutex = new(sync.Mutex)

// SSEChannel model
type SSEChannel struct {
	Clients  []chan string
	Notifier chan string
}

var sseChannel SSEChannel

func main() {
	fmt.Println("SSE-GO")

	sseChannel = SSEChannel{
		Clients:  make([]chan string, 0),
		Notifier: make(chan string),
	}

	done := make(chan interface{})
	defer close(done)

	go broadcaster(done)

	http.HandleFunc("/sse", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Connection doesnot support streaming", http.StatusBadRequest)
			return
		}

		sseChan := make(chan string)
		sseChannel.Clients = append(sseChannel.Clients, sseChan)

		// this go routine reads and streams into the
		// channel
		d := make(chan interface{})
		defer close(d)
		defer fmt.Println("Closing channel.")

		for {
			select {
			case <-d:
				close(sseChan)
				return
			case data := <-sseChan:
				fmt.Printf("data: %v \n\n", data)
				fmt.Fprintf(w, "data: %v \n\n", data)
				flusher.Flush()
			}
		}

	})

	http.HandleFunc("/log", logHTTPRequest)

	fmt.Println("Listening to 5000")
	http.ListenAndServe(":5000", nil)
}

func logHTTPRequest(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	if _, err := io.Copy(buf, r.Body); err != nil {
		fmt.Printf("Error: %v", err)
	}
	method := r.Method

	logMsg := fmt.Sprintf("Method: %v, Body: %v", method, buf.String())
	fmt.Println(logMsg)
	sseChannel.Notifier <- logMsg
}

func broadcaster(done <-chan interface{}) {
	fmt.Println("Broadcaster Started.")
	for {
		select {
		case <-done:
			return
		case data := <-sseChannel.Notifier:
			for _, channel := range sseChannel.Clients {
				channel <- data
			}
		}
	}
}
