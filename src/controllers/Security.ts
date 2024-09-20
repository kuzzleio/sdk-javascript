import { BaseController } from "./Base";
import { Role } from "../core/security/Role";
import { RoleSearchResult } from "../core/searchResult/Role";
import { Profile } from "../core/security/Profile";
import { ProfileSearchResult } from "../core/searchResult/Profile";
import { User } from "../core/security/User";
import { UserSearchResult } from "../core/searchResult/User";
import { ArgsDefault } from "../types";

export class SecurityController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle
   */
  constructor(kuzzle) {
    super(kuzzle, "security");
  }

  /**
   * Creates a new API key for a user.
   *
   * @param {String} userId - User kuid
   * @param {String} description - API key description
   * @param {Object} [options] - { _id, expiresIn, refresh, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} ApiKey { _id, _source }
   */
  createApiKey(
    userId,
    description,
    options: ArgsSecurityControllerCreateApiKey = {}
  ) {
    const request: any = {
      _id: options._id,
      action: "createApiKey",
      body: {
        description,
      },
      expiresIn: options.expiresIn,
      refresh: options.refresh,
      userId,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Checks if an API action can be executed by a user.
   *
   * @param {String} kuid - User kuid
   * @param {Object} requestPayload - Request to check
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Boolean>} Whether the action is allowed
   */
  checkRights(
    kuid,
    requestPayload,
    options: ArgsSecurityControllerCheckRights = {}
  ) {
    const request: any = {
      action: "checkRights",
      body: requestPayload,
      userId: kuid,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) => response.result.allowed
    );
  }

  /**
   * Deletes a user's API key.
   *
   * @param {String} userId - User kuid
   * @param {String} id - API key ID
   * @param {Object} [options] - { refresh, triggerEvents, queuable, timeout }
   *
   * @returns {Promise} API key deletion result
   */
  deleteApiKey(userId, id, options: ArgsSecurityControllerDeleteApiKey = {}) {
    const request: any = {
      _id: id,
      action: "deleteApiKey",
      refresh: options.refresh,
      userId,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options);
  }

  /**
   * Searches for API keys of a user.
   *
   * @param {String} userId - User kuid
   * @param {Object} [query] - Search query
   * @param {Object} [options] - { from, size, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<object[]>} - { hits, total }
   */
  searchApiKeys(
    userId,
    query = {},
    options: ArgsSecurityControllerSearchApiKeys = {}
  ) {
    const request: any = {
      action: "searchApiKeys",
      body: query,
      from: options.from,
      lang: options.lang,
      size: options.size,
      userId,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Creates credentials for a strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User kuid
   * @param {Object} body - Credentials data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Created credentials
   */
  createCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerCreateCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "createCredentials",
      body,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Creates the first admin user.
   *
   * @param {String} _id - User kuid
   * @param {Object} body - User data
   * @param {Object} [options] - { reset, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} Created admin user
   */
  createFirstAdmin(
    _id,
    body,
    options: ArgsSecurityControllerCreateFirstAdmin = {}
  ) {
    const request: any = {
      _id,
      action: "createFirstAdmin",
      body,
      reset: options.reset,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Creates or replaces a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} body - Profile definition
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Profile>} The created or replaced profile
   */
  createOrReplaceProfile(
    _id,
    body,
    options: ArgsSecurityControllerCreateOrReplaceProfile = {}
  ) {
    const request: any = {
      _id,
      action: "createOrReplaceProfile",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Creates or replaces a security role.
   *
   * @param {String} _id - Role id
   * @param {Object} body - Role definition
   * @param {Object} [options] - { force, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Role>} The created or replaced role
   */
  createOrReplaceRole(
    _id,
    body,
    options: ArgsSecurityControllerCreateOrReplaceRole = {}
  ) {
    const request: any = {
      _id,
      action: "createOrReplaceRole",
      body,
      force: options.force ? true : null,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  /**
   * Creates a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} body - Profile definition
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Profile>} The created profile
   */
  createProfile(_id, body, options: ArgsSecurityControllerCreateProfile = {}) {
    const request: any = {
      _id,
      action: "createProfile",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Creates a restricted user.
   *
   * @param {Object} body - User content
   * @param {String} [_id] - User kuid
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} The created restricted user
   */
  createRestrictedUser(
    body,
    _id = null,
    options: ArgsSecurityControllerCreateRestrictedUser = {}
  ) {
    if (!body.content) {
      body.content = {};
    }

    const request: any = {
      _id,
      action: "createRestrictedUser",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Creates a security role.
   *
   * @param {String} _id - Role id
   * @param {Object} body - Role definition
   * @param {Object} [options] - { force, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Role>} The created role
   */
  createRole(_id, body, options: ArgsSecurityControllerCreateRole = {}) {
    const request: any = {
      _id,
      action: "createRole",
      body,
      force: options.force ? true : null,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  /**
   * Creates a user.
   *
   * @param {String} _id - User id
   * @param {Object} body - User data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} The created user
   */
  createUser(_id, body, options: ArgsSecurityControllerCreateUser = {}) {
    const request: any = {
      _id,
      action: "createUser",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Deletes credentials for a strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User kuid
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  deleteCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerDeleteCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "deleteCredentials",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  deleteProfile(_id, options: ArgsSecurityControllerDeleteProfile = {}) {
    const request: any = {
      _id,
      action: "deleteProfile",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes a security role.
   *
   * @param {String} _id - Role id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  deleteRole(_id, options: ArgsSecurityControllerDeleteRole = {}) {
    const request: any = {
      _id,
      action: "deleteRole",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes a user.
   *
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  deleteUser(_id, options: ArgsSecurityControllerDeleteUser = {}) {
    const request: any = {
      _id,
      action: "deleteUser",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves all credential fields for every strategy.
   *
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The credentials fields
   */
  getAllCredentialFields(
    options: ArgsSecurityControllerGetAllCredentialFields = {}
  ) {
    const request: any = {
      action: "getAllCredentialFields",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves the credential fields for a specific strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The credential fields
   */
  getCredentialFields(
    strategy,
    options: ArgsSecurityControllerGetCredentialFields = {}
  ) {
    const request: any = {
      action: "getCredentialFields",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves credentials for a specific strategy and user.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The credentials
   */
  getCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerGetCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "getCredentials",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves credentials by ID for a specific strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The credentials
   */
  getCredentialsById(
    strategy,
    _id,
    options: ArgsSecurityControllerGetCredentialsById = {}
  ) {
    const request: any = {
      _id,
      action: "getCredentialsById",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Profile>} The profile
   */
  getProfile(_id, options: ArgsSecurityControllerGetProfile = {}) {
    return this.query({ _id, action: "getProfile" }, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Retrieves the profile mapping.
   *
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The profile mapping
   */
  getProfileMapping(options: ArgsSecurityControllerGetProfileMapping = {}) {
    const request: any = {
      action: "getProfileMapping",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves the rights of a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array>} The profile rights
   */
  getProfileRights(_id, options: ArgsSecurityControllerGetProfileRights = {}) {
    const request: any = {
      _id,
      action: "getProfileRights",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result.hits);
  }

  /**
   * Retrieves a security role.
   *
   * @param {String} _id - Role id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Role>} The role
   */
  getRole(_id, options: ArgsSecurityControllerGetRole = {}) {
    const request: any = {
      _id,
      action: "getRole",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  /**
   * Retrieves the role mapping.
   *
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The role mapping
   */
  getRoleMapping(options: ArgsSecurityControllerGetRoleMapping = {}) {
    const request: any = {
      action: "getRoleMapping",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves a user.
   *
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} The user
   */
  getUser(_id, options: ArgsSecurityControllerGetUser = {}) {
    const request: any = {
      _id,
      action: "getUser",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Retrieves the user mapping.
   *
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} The user mapping
   */
  getUserMapping(options: ArgsSecurityControllerGetUserMapping = {}) {
    const request: any = {
      action: "getUserMapping",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves the rights of a user.
   *
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array>} The user rights
   */
  getUserRights(_id, options: ArgsSecurityControllerGetUserRights = {}) {
    const request: any = {
      _id,
      action: "getUserRights",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result.hits);
  }

  /**
   * Retrieves the authentication strategies used by a user.
   *
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array>} The user strategies
   */
  getUserStrategies(
    _id,
    options: ArgsSecurityControllerGetUserStrategies = {}
  ) {
    const request: any = {
      _id,
      action: "getUserStrategies",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result.strategies);
  }

  /**
   * Checks if a user has credentials for a specific strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User id
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Boolean>} Whether the user has credentials
   */
  hasCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerHasCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "hasCredentials",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes multiple profiles.
   *
   * @param {Array<String>} ids - Profile ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  mDeleteProfiles(ids, options: ArgsSecurityControllerMDeleteProfiles = {}) {
    const request: any = {
      action: "mDeleteProfiles",
      body: { ids },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes multiple roles.
   *
   * @param {Array<String>} ids - Role ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  mDeleteRoles(ids, options: ArgsSecurityControllerMDeleteRoles = {}) {
    const request: any = {
      action: "mDeleteRoles",
      body: { ids },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Deletes multiple users.
   *
   * @param {Array<String>} ids - User ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Deletion result
   */
  mDeleteUsers(ids, options: ArgsSecurityControllerMDeleteUsers = {}) {
    const request: any = {
      action: "mDeleteUsers",
      body: { ids },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Retrieves multiple profiles.
   *
   * @param {Array<String>} ids - Profile ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array.<Profile>>} The profiles
   */
  mGetProfiles(ids, options: ArgsSecurityControllerMGetProfiles = {}) {
    const request: any = {
      action: "mGetProfiles",
      body: { ids },
    };

    return this.query(request, options).then(
      (response) =>
        response.result.hits.map(
          (hit) => new Profile(this.kuzzle, hit._id, hit._source)
        )
    );
  }

  /**
   * Retrieves multiple users.
   *
   * @param {Array<String>} ids - User ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array.<User>>} The users
   */
  mGetUsers(ids, options: ArgsSecurityControllerMGetUsers = {}) {
    const request: any = {
      action: "mGetUsers",
      body: { ids },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) =>
      response.result.hits.map(
        (hit) => new User(this.kuzzle, hit._id, hit._source)
      )
    );
  }

  /**
   * Retrieves multiple roles.
   *
   * @param {Array<String>} ids - Role ids
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Array.<Role>>} The roles
   */
  mGetRoles(ids, options: ArgsSecurityControllerMGetRoles = {}) {
    const request: any = {
      action: "mGetRoles",
      body: { ids },
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) =>
      response.result.hits.map(
        (hit) => new Role(this.kuzzle, hit._id, hit._source.controllers)
      )
    );
  }

  /**
   * Refreshes a collection.
   *
   * @param {String} collection - The collection name
   *
   * @returns {Promise} Refresh result
   */
  refresh(collection) {
    return this.query({
      action: "refresh",
      collection,
    });
  }

  /**
   * Replaces a user with new data.
   *
   * @param {String} _id - User id
   * @param {Object} body - User data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} The replaced user
   */
  replaceUser(_id, body, options: ArgsSecurityControllerReplaceUser = {}) {
    const request: any = {
      _id,
      action: "replaceUser",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Searches for profiles based on a query.
   *
   * @param {Object} body - Search query
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<ProfileSearchResult>} Search result
   */
  searchProfiles(body, options: ArgsSecurityControllerSearchProfiles = {}) {
    const request: any = {
      action: "searchProfiles",
      body,
    };

    // Exclude undefined values and triggerEvents if not defined
    for (const [key, value] of Object.entries(options)) {
      if (key !== "triggerEvents" && value !== undefined) {
        request[key] = value;
      }
    }

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new ProfileSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  /**
   * Searches for roles based on a query.
   *
   * @param {Object} body - Search query
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<RoleSearchResult>} Search result
   */
  searchRoles(body, options: ArgsSecurityControllerSearchRoles = {}) {
    const request: any = {
      action: "searchRoles",
      body,
    };

    // Exclude undefined values and triggerEvents if not defined
    for (const [key, value] of Object.entries(options)) {
      if (key !== "triggerEvents" && value !== undefined) {
        request[key] = value;
      }
    }

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new RoleSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  /**
   * Searches for users based on a query.
   *
   * @param {Object} body - Search query
   * @param {Object} [options] - { from, size, scroll, lang, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<UserSearchResult>} Search result
   */
  searchUsers(body, options: ArgsSecurityControllerSearchUsers = {}) {
    const request: any = {
      action: "searchUsers",
      body,
    };

    for (const opt of ["from", "size", "scroll", "lang"]) {
      if (options[opt] !== undefined) {
        request[opt] = options[opt];
      }
    }

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new UserSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  /**
   * Updates credentials for a user and strategy.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User id
   * @param {Object} body - Updated credentials data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Updated credentials
   */
  updateCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerUpdateCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "updateCredentials",
      body,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Updates a security profile.
   *
   * @param {String} _id - Profile id
   * @param {Object} body - Updated profile definition
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Profile>} The updated profile
   */
  updateProfile(_id, body, options: ArgsSecurityControllerUpdateProfile = {}) {
    const request: any = {
      _id,
      action: "updateProfile",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Updates the profile mapping.
   *
   * @param {Object} body - Updated mapping
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Update result
   */
  updateProfileMapping(
    body,
    options: ArgsSecurityControllerUpdateProfileMapping = {}
  ) {
    const request: any = {
      action: "updateProfileMapping",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Updates a security role.
   *
   * @param {String} _id - Role id
   * @param {Object} body - Updated role definition
   * @param {Object} [options] - { force, triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Role>} The updated role
   */
  updateRole(_id, body, options: ArgsSecurityControllerUpdateRole = {}) {
    const request: any = {
      _id,
      action: "updateRole",
      body,
      force: options.force ? true : null,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  /**
   * Updates the role mapping.
   *
   * @param {Object} body - Updated mapping
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Update result
   */
  updateRoleMapping(
    body,
    options: ArgsSecurityControllerUpdateRoleMapping = {}
  ) {
    const request: any = {
      action: "updateRoleMapping",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Updates a user.
   *
   * @param {String} _id - User id
   * @param {Object} body - Updated user data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<User>} The updated user
   */
  updateUser(_id, body, options: ArgsSecurityControllerUpdateUser = {}) {
    const request: any = {
      _id,
      action: "updateUser",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Updates the user mapping.
   *
   * @param {Object} body - Updated mapping
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Update result
   */
  updateUserMapping(
    body,
    options: ArgsSecurityControllerUpdateUserMapping = {}
  ) {
    const request: any = {
      action: "updateUserMapping",
      body,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Validates credentials for a strategy and user.
   *
   * @param {String} strategy - Authentication strategy
   * @param {String} _id - User id
   * @param {Object} body - Credentials data
   * @param {Object} [options] - { triggerEvents, queuable, timeout }
   *
   * @returns {Promise.<Object>} Validation result
   */
  validateCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerValidateCredentials = {}
  ) {
    const request: any = {
      _id,
      action: "validateCredentials",
      body,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response) => response.result);
  }
}

export interface ArgsSecurityControllerCreateApiKey extends ArgsDefault {
  expiresIn?: string | number;
  _id?: string;
  refresh?: "wait_for" | "false";
}

export type ArgsSecurityControllerCheckRights = ArgsDefault;

export interface ArgsSecurityControllerDeleteApiKey extends ArgsDefault {
  refresh?: "wait_for" | "false";
}

export interface ArgsSecurityControllerSearchApiKeys extends ArgsDefault {
  from?: number;
  size?: number;
  lang?: string;
}

export type ArgsSecurityControllerCreateCredentials = ArgsDefault;

export interface ArgsSecurityControllerCreateFirstAdmin extends ArgsDefault {
  reset?: boolean;
}

export type ArgsSecurityControllerCreateOrReplaceProfile = ArgsDefault;

export interface ArgsSecurityControllerCreateOrReplaceRole extends ArgsDefault {
  force?: boolean;
}

export type ArgsSecurityControllerCreateProfile = ArgsDefault;

export type ArgsSecurityControllerCreateRestrictedUser = ArgsDefault;

export interface ArgsSecurityControllerCreateRole extends ArgsDefault {
  force?: boolean;
}

export type ArgsSecurityControllerCreateUser = ArgsDefault;

export type ArgsSecurityControllerDeleteCredentials = ArgsDefault;

export type ArgsSecurityControllerDeleteProfile = ArgsDefault;

export type ArgsSecurityControllerDeleteRole = ArgsDefault;

export type ArgsSecurityControllerDeleteUser = ArgsDefault;

export type ArgsSecurityControllerGetAllCredentialFields = ArgsDefault;

export type ArgsSecurityControllerGetCredentialFields = ArgsDefault;

export type ArgsSecurityControllerGetCredentials = ArgsDefault;

export type ArgsSecurityControllerGetCredentialsById = ArgsDefault;

export type ArgsSecurityControllerGetProfile = ArgsDefault;

export type ArgsSecurityControllerGetProfileMapping = ArgsDefault;

export type ArgsSecurityControllerGetProfileRights = ArgsDefault;

export type ArgsSecurityControllerGetRole = ArgsDefault;

export type ArgsSecurityControllerGetRoleMapping = ArgsDefault;

export type ArgsSecurityControllerGetUser = ArgsDefault;

export type ArgsSecurityControllerGetUserMapping = ArgsDefault;

export type ArgsSecurityControllerGetUserRights = ArgsDefault;

export type ArgsSecurityControllerGetUserStrategies = ArgsDefault;

export type ArgsSecurityControllerHasCredentials = ArgsDefault;

export type ArgsSecurityControllerMDeleteProfiles = ArgsDefault;

export type ArgsSecurityControllerMDeleteRoles = ArgsDefault;

export type ArgsSecurityControllerMDeleteUsers = ArgsDefault;

export type ArgsSecurityControllerMGetProfiles = ArgsDefault;

export type ArgsSecurityControllerMGetUsers = ArgsDefault;

export type ArgsSecurityControllerMGetRoles = ArgsDefault;

export type ArgsSecurityControllerReplaceUser = ArgsDefault;

export type ArgsSecurityControllerSearchProfiles = ArgsDefault;

export type ArgsSecurityControllerSearchRoles = ArgsDefault;

export type ArgsSecurityControllerSearchUsers = ArgsDefault;

export type ArgsSecurityControllerUpdateCredentials = ArgsDefault;

export type ArgsSecurityControllerUpdateProfile = ArgsDefault;

export type ArgsSecurityControllerUpdateProfileMapping = ArgsDefault;

export interface ArgsSecurityControllerUpdateRole extends ArgsDefault {
  force?: boolean;
}

export type ArgsSecurityControllerUpdateRoleMapping = ArgsDefault;

export type ArgsSecurityControllerUpdateUser = ArgsDefault;

export type ArgsSecurityControllerUpdateUserMapping = ArgsDefault;

export type ArgsSecurityControllerValidateCredentials = ArgsDefault;
