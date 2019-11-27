const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const redis = require('redis');// redis client
const ejs = require('ejs');

const port = 3000;
const app = express();

// create redis client
const client = redis.createClient();
client.on('connect', function(){
    console.log('Redis server connected');
});

// setting up view engine
app.set('view', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',  (req, res) => {
    var title = 'Title of the page';

    client.lrange('task', 0, -1, function(error, reply){
        ejs.renderFile("./views/index.ejs", 
        {
            title: title,
            task: reply
        }, null, 
            (err, html) => {res.end(html)})
    });

    
});

app.post('/task/add', function(req,res){
    var task = req.body.task;
    client.rpush('task', task, function(err,reply){
        if(err){
            console.log(err);
        }
        console.log("Task added");
        res.redirect('/');
    })
})

app.post('/task/delete', function(req, res){
    const delTasks = req.body.task;
    client.lrange('task', 0, -1, function(err, task){
        for(let i =0; i< task.length; i++) {
            if(delTasks.indexOf(task[i]) > -1){
                client.lrem('task', 0, task[i], function(err, reply){
                    if(err) {
                        console.log(err); 
                    }
                    console.log("Task deleted");
                })
            }
        }
        res.redirect('/');
    })
})
app.listen(port);

console.log(`server started on ${port}`);
module.exports = app;
