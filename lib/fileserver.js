'use strict';

const fs = require('fs');
const path = require('path');
const baseDirectory = process.env.BASE_DIRECTORY || '/data';
const ejs = require('ejs');

const flistTemplate = fs.readFileSync(path.join(__dirname, '..', 'html', 'filelist.ejs'), 'utf-8');

function download(req, res) {
    
    const dPath = req.baseUrl.replace('/download', '');
    const fPath = path.join(baseDirectory, dPath);
    res.download(fPath, function(err) {
        if (err) {
            console.error(err.message);
            res.send('Error downloading file');
        }
    });

}

function fileServer(req) {

    const baseUrl = req.baseUrl || req.url;
    const dPath = baseUrl.replace('/fileserver', '') || '/';
    const fPath = path.join(baseDirectory, dPath);
    let directories = [];
    let files = [];
    fs.readdirSync(fPath).forEach(f => {
        const fullPath = path.join(fPath, f);
        const stats = fs.lstatSync(fullPath);
        if (stats.isFile()) {
            files.push({
                name: f,
                size: stats.size
            });
        } else if (stats.isDirectory()) {
            directories.push(f);
        }
    });
    const p = dPath.split('/');
    const backPath = p.slice(0, p.length - 1).join('/');

    const content = ejs.render(flistTemplate, {
        path: dPath,
        files,
        directories,
        backPath
    });
    
    return content;

}

function fServerRecursive(req, res) {
    try {
        const content = fileServer(req);
        res.send(content);
    } catch (err) {
        logger.error(`File listing failed: ${err.message}`);
        res.status(500).send('File listing failed');
    }
}

module.exports.download = download;
module.exports.fileServer = fileServer;
module.exports.fServerRecursive = fServerRecursive;
