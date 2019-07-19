package main

import (
	"fmt"
	"log"
	"os"
	"time"
	"encoding/json"

	"github.com/kuzzleio/sdk-go/protocol/websocket"
	kuzzlepkg "github.com/kuzzleio/sdk-go/kuzzle"
	"github.com/kuzzleio/sdk-go/types"
)

func main() {
	c := websocket.NewWebSocket("kuzzle", nil)
	kuzzle, _ := kuzzlepkg.NewKuzzle(c, nil)

	connectErr := kuzzle.Connect()
	if connectErr != nil {
		log.Fatal(connectErr)
		os.Exit(1)
	}

	rescueStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	[snippet-code]

	go func() {
		time.Sleep(30 * time.Second)
		os.Exit(1)
	}()

	b := make([]byte, 4096)
	n, _ := r.Read(b)

	os.Stdout = rescueStdout
	fmt.Print(string(b[:n]))
}
