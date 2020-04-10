class BaseHook {
  constructor (event, filters) {

  }

  async action () {

  }
}

backend.registerHook({
  event: 'generic:document:beforeWrite',
  action: request => request,
  filters: [
    {
      exists: 'body.clientId'
    },
    {
      equals: { 'input.resource.index': 'omniscient' }
    }
  ]
})

this.hooks = {
  'generic:document:beforeWrite': {
    action: () => {},
    filters: [
      {
        // filter for event first arg
        exists: 'body.clientId'
      },
      {
        // filter for event second arg
        equals: { 'input.resource.index': 'omniscient' }
      }
    ]
  }
};
