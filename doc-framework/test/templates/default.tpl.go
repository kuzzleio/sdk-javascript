package main

import (
	"fmt"
	"log"
	"os"
	"encoding/json"

	"github.com/kuzzleio/sdk-go/protocol/websocket"
	"github.com/kuzzleio/sdk-go/kuzzle"
	"github.com/kuzzleio/sdk-go/types"
)

func main() {
	c := websocket.NewWebSocket("kuzzle", nil)
	kuzzle, _ := kuzzle.NewKuzzle(c, nil)

	connectErr := kuzzle.Connect()
	if connectErr != nil {
		log.Fatal(connectErr)
		os.Exit(1)
	}

	[snippet-code]
}
