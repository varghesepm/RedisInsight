import { BrowserHistoryMode } from 'src/common/constants';
import {
  expect,
  describe,
  before,
  deps,
  getMainCheckFn
} from '../deps';

const { request, server, localDb, constants } = deps;

// endpoint to test
const endpoint = id => request(server).delete(`/${constants.API.DATABASES}/${constants.TEST_INSTANCE_ID}/history/${id}`);

const mainCheckFn = getMainCheckFn(endpoint);

describe(`DELETE /databases/:instanceId/history/:id`, () => {
  before(async () => {
    await localDb.createDatabaseInstances();

    await localDb.generateBrowserHistory({
      databaseId: constants.TEST_INSTANCE_ID,
      mode: BrowserHistoryMode.Pattern,
    }, 10, true)

    await localDb.generateBrowserHistory({
      databaseId: constants.TEST_INSTANCE_ID,
      mode: BrowserHistoryMode.Redisearch,
    }, 10, true)
  });

  describe('Common', () => {
    [
      {
        name: 'Should remove single browser history item',
        endpoint: () => endpoint(constants.TEST_BROWSER_HISTORY_ID_2),
        before: async () => {
          expect(await localDb.getBrowserHistoryById(constants.TEST_BROWSER_HISTORY_ID_2)).to.be.an('object')
        },
        after: async () => {
          expect(await localDb.getBrowserHistoryById(constants.TEST_BROWSER_HISTORY_ID_2)).to.eql(null)
        },
      },
      {
        name: 'Should return Not Found Error',
        endpoint: () => endpoint(constants.TEST_BROWSER_HISTORY_ID_2),
        statusCode: 404,
        responseBody: {
          statusCode: 404,
          error: 'Not Found'
        },
        before: async () => {
          expect(await localDb.getBrowserHistoryById(constants.TEST_BROWSER_HISTORY_ID_2)).to.eql(null)
        },
      },
    ].map(mainCheckFn);
  });
});
