import * as path from 'path';
import { t } from 'testcafe';
import { rte } from '../../../helpers/constants';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage, BulkActionsPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneRedisearch } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { deleteAllKeysFromDB, verifyKeysDisplayedInTheList } from '../../../helpers/keys';

const browserPage = new BrowserPage();
const bulkActionsPage = new BulkActionsPage();

const dbParameters = { host: ossStandaloneRedisearch.host, port: ossStandaloneRedisearch.port };
const filesToUpload = ['bulkUplAllKeyTypes.txt', 'bigKeysData.rtf'];
const filePathes = {
    allKeysFile: path.join('..', '..', '..', 'test-data', 'bulk-upload', filesToUpload[0]),
    bigDataFile: path.join('..', '..', '..', 'test-data', 'bulk-upload', filesToUpload[1])
};
const keyNames = ['hashkey1', 'listkey1', 'setkey1', 'zsetkey1', 'stringkey1', 'jsonkey1', 'streamkey1', 'graphkey1', 'tskey1'];
const verifyCompletedResultText = async(resultsText: string[]): Promise<void> => {
    for (const result of resultsText) {
        await t.expect(bulkActionsPage.bulkUploadCompletedSummary.textContent).contains(result, 'Bulk upload completed summary not correct');
    }
};

fixture `Bulk Upload`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteAllKeysFromDB(dbParameters.host, dbParameters.port);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    });
test('Verify bulk upload of different text docs formats', async t => {
    // Verify bulk upload for docker app version
    const allKeysResults = ['9Commands Processed', '9Success', '0Errors'];
    const bigKeysResults = ['10 000Commands Processed', '10 000Success', '0Errors'];
    const defaultText = 'Select or drag and drop a file';

    // Open bulk actions
    await t.click(browserPage.bulkActionsButton);
    // Open bulk upload tab
    await t.click(bulkActionsPage.bulkUpdateTab);
    // Verify that Upload button disabled by default
    await t.expect(bulkActionsPage.actionButton.hasAttribute('disabled')).ok('Upload button enabled without added file');

    // Verify that keys of all types can be uploaded
    await bulkActionsPage.uploadFileInBulk(filePathes.allKeysFile);
    await verifyCompletedResultText(allKeysResults);
    await t.expect(bulkActionsPage.bulkUploadCompletedSummary.textContent).notContains('0:00:00.00', 'Bulk upload completed summary not correct');
    await browserPage.searchByKeyName('*key1');
    await verifyKeysDisplayedInTheList(keyNames);

    // Verify that Upload button disabled after starting new upload
    await t.click(bulkActionsPage.bulkActionStartNewButton);
    await t.expect(bulkActionsPage.actionButton.hasAttribute('disabled')).ok('Upload button enabled without added file');

    // Verify that user can remove uploaded file
    await t.setFilesToUpload(bulkActionsPage.bulkUploadInput, [filePathes.bigDataFile]);
    await t.expect(bulkActionsPage.bulkUploadContainer.textContent).contains(filesToUpload[1], 'Filename not displayed in upload input');
    await t.click(bulkActionsPage.removeFileBtn);
    await t.expect(bulkActionsPage.bulkUploadContainer.textContent).contains(defaultText, 'File not removed from upload input');

    // Verify that user can upload 10000 keys
    await bulkActionsPage.uploadFileInBulk(filePathes.bigDataFile);
    await verifyCompletedResultText(bigKeysResults);
});