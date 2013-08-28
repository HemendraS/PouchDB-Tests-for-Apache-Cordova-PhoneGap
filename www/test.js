
  Test = {

    server: "http://hammock.treehouse.su",

    generateGUID: function() {
      var d = new Date()
      return 'test-' + d.getTime()
    },

    Pouch: function() {
      console.log('Running testPouch')
      var testPouch = Pouch(this.generateGUID())
      testPouch.post({title: 'mic check'}, function(err, res) {
        console.log(JSON.stringify(res))
        console.log(err)
        console.log('Finished testPouch')

      }) 
    },

    PostAndGet: function() {
      var dbId = this.generateGUID()
      var docId = this.generateGUID()
      var db = Pouch(dbId)
      db.put({_id: docId, title: 'foo'}, function(err, res) {
        db.get(docId, function(err, doc) {
          console.log(JSON.stringify(doc))
          console.log(err)
        })
      })

    },


    Query: function() {
      console.log('Running testPouchAllDocs')
      function map(doc) {
        if(doc.title) {
          emit(doc.title, null);
        }
      }
      var date = new Date()
      var testPouch = Pouch('test-' + date.getTime())
      testPouch.post({title: '1'}, function(err, res) {
        console.log('Pouch post 1:')
        console.log(JSON.stringify(res))
        console.log(err)
        testPouch.get(res.id, function(err, res) {
          console.log('Pouch get 1:')
          console.log(JSON.stringify(res))
          console.log(err)
          testPouch.post({title: '2'}, function(err, res) {
            console.log('Pouch post 2:')
            console.log(JSON.stringify(res))
            console.log(err)
            testPouch.get(res.id, function(err, res) {
              console.log('Pouch get 2:')
              console.log(JSON.stringify(res))
              console.log(err)
              testPouch.query({map: map}, {reduce: false}, function(err, response) {
                console.log('Pouch query:')
                console.log(JSON.stringify(response))
                console.log(err)
              })
            })
          })
        })
      })
    },

    AllDocs: function() {
      console.log('Running testPouchAllDocs')
      var date = new Date()
      var testPouch = Pouch('test') //+ date.getTime())
      testPouch.post({title: '1'}, function(err, res) {
        console.log('Pouch post 1:')
        console.log(JSON.stringify(res))
        console.log(err)
        testPouch.get(res.id, function(err, res) {
          console.log('Pouch get 1:')
          console.log(JSON.stringify(res))
          console.log(err)
          testPouch.post({title: '2'}, function(err, res) {
            console.log('Pouch post 2:')
            console.log(JSON.stringify(res))
            console.log(err)
            testPouch.get(res.id, function(err, res) {
              console.log('Pouch get 2:')
              console.log(JSON.stringify(res))
              console.log(err)
              testPouch.allDocs({include_docs: true}, function(err, response) {
                console.log('Pouch allDocs:')
                console.log(JSON.stringify(response))
                console.log(err)
              })
            })
          })
        })
      })
    },

    ReplicatePull: function() {
      console.log('######## BEGIN testPouchReplicatePull #########')
      var remote = this.server + "/testpouch"
      var local = "testpouch"
      var db = new Pouch(local)

      var xhr = new XMLHttpRequest();
      xhr.open('GET', remote, true);

      xhr.onload = function(e) {
        if (this.status == 200) {
          console.log('pull starting for ' + local + ' <- ' + remote)
          // Pull
          Pouch.replicate(remote, local, function(err,changes) {
              console.log('pull replication complete for ' + local + " <- " + remote)
              db.get('coolBeans', function(err, doc) {
                console.log(JSON.stringify(doc))
              })
          })
        }
      };

      xhr.send();

    },

    OpenDbThenReplicateToDb: function() {
      // Open/create some database
      var db = Pouch('db')
      Pouch.replicate(this.server + '/testpouch', 'dbB',function(err, changes) {
        console.log('err: ' + err)
        console.log('changes:' + JSON.stringify(changes))
        db.allDocs({include_docs: true}, function(err, response) {
          console.log('allDocs: ' + JSON.stringify(response)) 
          console.assert(response.total_rows == 2, "Replication did not complete correctly.")
        })
        // In case this is a problem with allDocs...
        db.get('coolBeans', function(err, doc) {
          console.log('get doc: ' + JSON.stringify(doc))
          console.log('get err: ' + JSON.stringify(err))
        })
      })
    },

    ReplicateToDbThenOpenDb: function() {
      Pouch.replicate(this.server + '/testpouch', 'db',function(err, changes) {
        console.log('err: ' + err)
        console.log('changes:' + JSON.stringify(changes))
        var db = Pouch('db')
        db.allDocs({include_docs: true}, function(err, response) {
          console.log('allDocs: ' + JSON.stringify(response)) 
          console.assert(response.total_rows == 2, "Replication did not complete correctly.")
        })
      })
    },

    ReplicateToDbaThenReplicateToDbbThenOpenDba: function() {
      Pouch.replicate(this.server + '/testpouch', 'dba',function(err, changes) {
        console.log('err: ' + err)
        console.log('changes:' + JSON.stringify(changes))
        Pouch.replicate(this.server + '/testpouch', 'dbb',function(err, changes) {
          console.log('err: ' + err)
          console.log('changes:' + JSON.stringify(changes))
          var dba = Pouch('dba')
          dba.allDocs({include_docs: true}, function(err, response) {
            console.log('allDocs: ' + JSON.stringify(response)) 
            console.assert(response.total_rows == 2, "Replication did not complete correctly.")
          })
        })
      })
    },

    ReplicateParallelToDbaAndReplicateToDbbThenOpenDba: function() {
      Pouch.replicate(this.server + '/testpouch', 'dbb',function(err, changes) {
        console.log('err: ' + err)
        console.log('changes:' + JSON.stringify(changes))
      })
      Pouch.replicate(this.server + '/testpouch', 'dba',function(err, changes) {
        console.log('err: ' + err)
        console.log('changes:' + JSON.stringify(changes))
        var dba = Pouch('dba')
        /*
        dba.allDocs({include_docs: true}, function(err, response) {
          console.log('allDocs: ' + JSON.stringify(response)) 
          console.assert(response.total_rows == 2, "Replication did not complete correctly.")
        })
*/
      })
    }

  }
