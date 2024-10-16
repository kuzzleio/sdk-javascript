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
   * @param {Object} [options] - { _id, expiresIn, refresh }
   *
   * @returns {Promise.<Object>} ApiKey { _id, _source }
   */
  createApiKey(
    userId,
    description,
    options: ArgsSecurityControllerCreateApiKey = {}
  ) {
    const request = {
      _id: options._id,
      action: "createApiKey",
      body: {
        description,
      },
      expiresIn: options.expiresIn,
      refresh: options.refresh,
      userId,
    };

    return this.query(request, options).then((response) => response.result);
  }

  /**
   * Checks if an API action can be executed by a user
   *
   * @param {String} kuid - User kuid
   * @param {Object} requestPayload - Request to check
   */
  checkRights(
    kuid,
    requestPayload,
    options: ArgsSecurityControllerCheckRights
  ) {
    const request = {
      action: "checkRights",
      body: requestPayload,
      userId: kuid,
    };

    return this.query(request, options).then(
      (response) => response.result.allowed
    );
  }

  /**
   * Deletes an user API key.
   *
   * @param {String} userId - User kuid
   * @param {String} id - API key ID
   * @param {Object} [options] - { refresh }
   *
   * @returns {Promise}
   */
  deleteApiKey(userId, id, options: ArgsSecurityControllerDeleteApiKey = {}) {
    const request = {
      _id: id,
      action: "deleteApiKey",
      refresh: options.refresh,
      userId,
    };

    return this.query(request, options);
  }

  /**
   * Searches for a user API key.
   *
   * @param {String} userId - User kuid
   * @param {Object} [query] - Search query
   * @param {Object} [options] - { from, size }
   *
   * @returns {Promise.<object[]>} - { hits, total }
   */
  searchApiKeys(
    userId,
    query = {},
    options: ArgsSecurityControllerSearchApiKeys = {}
  ) {
    const request = {
      action: "searchApiKeys",
      body: query,
      from: options.from,
      lang: options.lang,
      size: options.size,
      userId,
    };

    return this.query(request, options).then((response) => response.result);
  }

  createCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerCreateCredentials = {}
  ) {
    return this.query(
      {
        _id,
        action: "createCredentials",
        body,
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  createFirstAdmin(
    _id,
    body,
    options: ArgsSecurityControllerCreateFirstAdmin = {}
  ) {
    const request = {
      _id,
      action: "createFirstAdmin",
      body,
      reset: options.reset,
    };

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  createOrReplaceProfile(
    _id,
    body,
    options: ArgsSecurityControllerCreateOrReplaceProfile = {}
  ) {
    const request = {
      _id,
      action: "createOrReplaceProfile",
      body,
    };

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  createOrReplaceRole(
    _id,
    body,
    options: ArgsSecurityControllerCreateOrReplaceRole = {}
  ) {
    const request = {
      _id,
      action: "createOrReplaceRole",
      body,
      force: options.force ? true : null,
    };
    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  createProfile(_id, body, options: ArgsSecurityControllerCreateProfile = {}) {
    const request = {
      _id,
      action: "createProfile",
      body,
    };

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  createRestrictedUser(
    body,
    _id = null,
    options: ArgsSecurityControllerCreateRestrictedUser = {}
  ) {
    if (!body.content) {
      body.content = {};
    }

    const request = {
      _id,
      action: "createRestrictedUser",
      body,
    };

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  createRole(_id, body, options: ArgsSecurityControllerCreateRole = {}) {
    const request = {
      _id,
      action: "createRole",
      body,
      force: options.force ? true : null,
    };
    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  createUser(_id, body, options: ArgsSecurityControllerCreateUser = {}) {
    const request = {
      _id,
      action: "createUser",
      body,
    };

    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  deleteCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerDeleteCredentials = {}
  ) {
    const request = {
      _id,
      action: "deleteCredentials",
      strategy,
    };

    return this.query(request, options).then((response) => response.result);
  }

  deleteProfile(_id, options: ArgsSecurityControllerDeleteProfile = {}) {
    const request = {
      _id,
      action: "deleteProfile",
    };
    return this.query(request, options).then((response) => response.result);
  }

  deleteRole(_id, options: ArgsSecurityControllerDeleteRole = {}) {
    const request = {
      _id,
      action: "deleteRole",
    };
    return this.query(request, options).then((response) => response.result);
  }

  deleteUser(_id, options: ArgsSecurityControllerDeleteUser = {}) {
    const request = {
      _id,
      action: "deleteUser",
    };
    return this.query(request, options).then((response) => response.result);
  }

  getAllCredentialFields(
    options: ArgsSecurityControllerGetAllCredentialFields = {}
  ) {
    return this.query(
      {
        action: "getAllCredentialFields",
      },
      options
    ).then((response) => response.result);
  }

  getCredentialFields(
    strategy,
    options: ArgsSecurityControllerGetCredentialFields = {}
  ) {
    return this.query(
      {
        action: "getCredentialFields",
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  getCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerGetCredentials = {}
  ) {
    return this.query(
      {
        _id,
        action: "getCredentials",
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  getCredentialsById(
    strategy,
    _id,
    options: ArgsSecurityControllerGetCredentialsById = {}
  ) {
    return this.query(
      {
        _id,
        action: "getCredentialsById",
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  getProfile(_id, options: ArgsSecurityControllerGetProfile = {}) {
    return this.query({ _id, action: "getProfile" }, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  getProfileMapping(options: ArgsSecurityControllerGetProfileMapping = {}) {
    return this.query(
      {
        action: "getProfileMapping",
      },
      options
    ).then((response) => response.result);
  }

  getProfileRights(_id, options: ArgsSecurityControllerGetProfileRights = {}) {
    return this.query(
      {
        _id,
        action: "getProfileRights",
      },
      options
    ).then((response) => response.result.hits);
  }

  getRole(_id, options: ArgsSecurityControllerGetRole = {}) {
    return this.query(
      {
        _id,
        action: "getRole",
      },
      options
    ).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  getRoleMapping(options: ArgsSecurityControllerGetRoleMapping = {}) {
    return this.query(
      {
        action: "getRoleMapping",
      },
      options
    ).then((response) => response.result);
  }

  getUser(_id, options: ArgsSecurityControllerGetUser = {}) {
    return this.query(
      {
        _id,
        action: "getUser",
      },
      options
    ).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  getUserMapping(options: ArgsSecurityControllerGetUserMapping = {}) {
    return this.query(
      {
        action: "getUserMapping",
      },
      options
    ).then((response) => response.result);
  }

  getUserRights(_id, options: ArgsSecurityControllerGetUserRights = {}) {
    return this.query(
      {
        _id,
        action: "getUserRights",
      },
      options
    ).then((response) => response.result.hits);
  }

  getUserStrategies(
    _id,
    options: ArgsSecurityControllerGetUserStrategies = {}
  ) {
    return this.query(
      {
        _id,
        action: "getUserStrategies",
      },
      options
    ).then((response) => response.result.strategies);
  }

  hasCredentials(
    strategy,
    _id,
    options: ArgsSecurityControllerHasCredentials = {}
  ) {
    return this.query(
      {
        _id,
        action: "hasCredentials",
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  mDeleteProfiles(ids, options: ArgsSecurityControllerMDeleteProfiles = {}) {
    const request = {
      action: "mDeleteProfiles",
      body: { ids },
    };

    return this.query(request, options).then((response) => response.result);
  }

  mDeleteRoles(ids, options: ArgsSecurityControllerMDeleteRoles = {}) {
    const request = {
      action: "mDeleteRoles",
      body: { ids },
    };

    return this.query(request, options).then((response) => response.result);
  }

  mDeleteUsers(ids, options: ArgsSecurityControllerMDeleteUsers = {}) {
    const request = {
      action: "mDeleteUsers",
      body: { ids },
    };

    return this.query(request, options).then((response) => response.result);
  }

  mGetProfiles(ids, options: ArgsSecurityControllerMGetProfiles = {}) {
    return this.query({ action: "mGetProfiles", body: { ids } }, options).then(
      (response) =>
        response.result.hits.map(
          (hit) => new Profile(this.kuzzle, hit._id, hit._source)
        )
    );
  }

  mGetUsers(ids, options: ArgsSecurityControllerMGetUsers = {}) {
    const request = {
      action: "mGetUsers",
      body: { ids },
    };

    return this.query(request, options).then((response) =>
      response.result.hits.map(
        (hit) => new User(this.kuzzle, hit._id, hit._source)
      )
    );
  }

  mGetRoles(ids, options: ArgsSecurityControllerMGetRoles = {}) {
    return this.query(
      {
        action: "mGetRoles",
        body: { ids },
      },
      options
    ).then((response) =>
      response.result.hits.map(
        (hit) => new Role(this.kuzzle, hit._id, hit._source.controllers)
      )
    );
  }

  refresh(collection, options: ArgsSecurityControllerRefresh = {}) {
    return this.query({
      action: "refresh",
      collection,
    }, options);
  }

  replaceUser(_id, body, options: ArgsSecurityControllerReplaceUser = {}) {
    const request = {
      _id,
      action: "replaceUser",
      body,
    };
    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  searchProfiles(body, options: ArgsSecurityControllerSearchProfiles = {}) {
    const request = {
      action: "searchProfiles",
      body,
    };
    for (const [key, value] of Object.entries(options)) {
      request[key] = value;
    }

    return this.query(request, options).then(
      (response) =>
        new ProfileSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  searchRoles(body, options: ArgsSecurityControllerSearchRoles = {}) {
    const request = {
      action: "searchRoles",
      body,
    };
    for (const [key, value] of Object.entries(options)) {
      request[key] = value;
    }

    return this.query(request, options).then(
      (response) =>
        new RoleSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  searchUsers(body, options: ArgsSecurityControllerSearchUsers = {}) {
    const request = {
      action: "searchUsers",
      body,
    };
    for (const opt of ["from", "size", "scroll", "lang"]) {
      request[opt] = options[opt];
    }

    return this.query(request, options).then(
      (response) =>
        new UserSearchResult(this.kuzzle, request, options, response.result)
    );
  }

  updateCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerUpdateCredentials = {}
  ) {
    return this.query(
      {
        _id,
        action: "updateCredentials",
        body,
        strategy,
      },
      options
    ).then((response) => response.result);
  }

  updateProfile(_id, body, options: ArgsSecurityControllerUpdateProfile = {}) {
    const request = {
      _id,
      action: "updateProfile",
      body,
    };

    return this.query(request, options).then(
      (response) =>
        new Profile(this.kuzzle, response.result._id, response.result._source)
    );
  }

  updateProfileMapping(
    body,
    options: ArgsSecurityControllerUpdateProfileMapping = {}
  ) {
    return this.query(
      {
        action: "updateProfileMapping",
        body,
      },
      options
    ).then((response) => response.result);
  }

  updateRole(_id, body, options: ArgsSecurityControllerUpdateRole = {}) {
    const request = {
      _id,
      action: "updateRole",
      body,
      force: options.force ? true : null,
    };

    return this.query(request, options).then(
      (response) =>
        new Role(
          this.kuzzle,
          response.result._id,
          response.result._source.controllers
        )
    );
  }

  updateRoleMapping(
    body,
    options: ArgsSecurityControllerUpdateRoleMapping = {}
  ) {
    return this.query(
      {
        action: "updateRoleMapping",
        body,
      },
      options
    ).then((response) => response.result);
  }

  updateUser(_id, body, options: ArgsSecurityControllerUpdateUser = {}) {
    const request = {
      _id,
      action: "updateUser",
      body,
    };
    return this.query(request, options).then(
      (response) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  updateUserMapping(
    body,
    options: ArgsSecurityControllerUpdateUserMapping = {}
  ) {
    return this.query(
      {
        action: "updateUserMapping",
        body,
      },
      options
    ).then((response) => response.result);
  }

  validateCredentials(
    strategy,
    _id,
    body,
    options: ArgsSecurityControllerValidateCredentials = {}
  ) {
    return this.query(
      {
        _id,
        action: "validateCredentials",
        body,
        strategy,
      },
      options
    ).then((response) => response.result);
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

export type ArgsSecurityControllerRefresh = ArgsDefault;
