try {
    kuzzle.get<%= _.upperFirst(_.camelCase(controller)) %>().<%= _.camelCase(action) %>();
    System.out.println("Success");
} catch (KuzzleException e) {
    System.err.println(e.getMessage());
}
