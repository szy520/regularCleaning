var fs = require('fs');
var moment = require('moment');
var path = require('path');
var del = require('del');
var storage = '/media/dx/work/dx/dxbim-api/dxbim-api/build/data';
var uploadedFilesPath = path.join(storage, 'tmp');
var uploadedTempFilesPath = path.join(storage, 'upload_tmp');
var co = require('co');
var newDate = new Date();
var nowTime = moment(newDate).format('YYYY-MM-DD HH:mm:ss');
var delLog = [];
var delFiles = [uploadedFilesPath, uploadedTempFilesPath]
var schedule = require("node-schedule");

//清理文件 每周一0:0:0执行一次；
var timedTask = schedule.scheduleJob('0 0 0 * * 1', function () {
    console.log('scheduleCronstyle:' + new Date());
    co(function* () {
        for (var i = 0; i < delFiles.length; i++) {
            yield removeFile(delFiles[i]);
        }
        if (delLog.length > 0) {
            var logFileName = nowTime + '.txt';
            var logFileContent = JSON.stringify(delLog)
            fs.writeFileSync(logFileName, logFileContent);
        }
    })
});
function removeFile(uploadedFilesPath) {
    return co(function* () {
        var uploadedFiles = fs.readdirSync(uploadedFilesPath);
        for (var i = 0; i < uploadedFiles.length; i++) {
            var uploadedFile = uploadedFiles[i];
            var uploadedFilePath = path.join(uploadedFilesPath, uploadedFile)
            var uploadedFileInfo = fs.lstatSync(uploadedFilePath);
            var uploadedFileTime = moment(uploadedFileInfo.mtime).valueOf();
            var expirationTime = moment(new Date(newDate)).subtract(1, 'day').valueOf();
            if (uploadedFileTime <= expirationTime) {
                yield del(uploadedFilePath, {
                    force: true
                })
                var delText = {
                    filePath: uploadedFilePath,
                    time: nowTime
                }
                console.log("del" + uploadedFilePath + 'ok')
                delLog.push(delText)
            }
        }
    })
}

