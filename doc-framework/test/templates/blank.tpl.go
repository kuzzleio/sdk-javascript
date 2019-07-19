package main

import (
	"fmt"
	"encoding/json"

	"github.com/kuzzleio/sdk-go/protocol/websocket"
	"github.com/kuzzleio/sdk-go/kuzzle"
	"github.com/kuzzleio/sdk-go/types"
)

func main() {
	[snippet-code]
	k.Server.Now(nil)
	fmt.Println("Everything is ok")
}
