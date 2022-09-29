import { JSONObject } from "./JSONObject";

export interface BaseRequest {
  controller: string;

  action: string;

  body?: JSONObject;
}
