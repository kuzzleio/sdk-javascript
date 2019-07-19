package main

import (
	"fmt"
	"encoding/json"
	"time"

	"github.com/kuzzleio/sdk-go/protocol/websocket"
	"github.com/kuzzleio/sdk-go/kuzzle"
)

func main() {
	c := websocket.NewWebSocket("kuzzle", nil)
	kuzzle, _ := kuzzle.NewKuzzle(c, nil)

	[snippet-code]

	connectErr := kuzzle.Connect()
	if connectErr != nil {
		log.Fatal(connectErr)
		os.Exit(1)
	}

	time.Sleep(100 * time.Millisecond)
}
