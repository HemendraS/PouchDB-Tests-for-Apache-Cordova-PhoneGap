var Server = "http://hammock.treehouse.su"

var Test = {

  test: function() {
    var a = Pouch('a', function() {
      Pouch.replicate(Server + '/testpouch', 'a', function(err, changes) {
        console.assert(changes.docs_written == 2, "First replication did not complete correctly.")
        var b = Pouch('b', function() {
          Pouch.replicate(Server + '/testpouch', 'b', function(err, changes) {
            console.assert(changes.docs_written == 2, "Second replication did not complete correctly.")
          })
        })
      })
    })
  }

}
