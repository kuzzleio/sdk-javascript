err := kuzzle.<%= _.upperFirst(_.camelCase(controller)) %>.<%= _.upperFirst(_.camelCase(action)) %>()

if err != nil {
  log.Fatal(err)
} else {
  fmt.Println("Success")
}
