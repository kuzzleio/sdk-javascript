try {
  const response = await kuzzle.security.getProfileMapping();

  console.log(response);
  /*
  {
    "mapping": {
      "policies": {
        "properties": {
          "roleId": {
            "type": "keyword"
          },
          "restrictedTo": {
            "properties": {
              "collections": {
                "type": "text"
              }
            },
            "index": {
              "type": "text"
            }
          }
        }
      },
    }
  }
   */
} catch (e) {
  console.error(e);
}
