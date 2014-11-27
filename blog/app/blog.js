 var liveoak;


function deletePost(id) {
	liveoak.remove( '/blog/storage/post',
	    {id: 'ObjectId(%22' + id + '%22)' },
	    { success: function(data) { 
		console.log( "Post Removed" ); 
	      },
	      error: function() {
		console.log( "Error removing post" );
	      }
	  } );
}

$( function() {
   liveoak = new LiveOak( { host: document.location.hostname, port: document.location.port } );

  function addPost(data) {
    // I know this could be better....   
    var id = get_id( data );
    $( '#allPosts' ).append( 
      $( '<div class="post" id="' + id + '">' ).append( 
        $('<h3 class="title">').append( data.title ) ).append( 
        $('<em class="content">').append( data.content ) ).append(
	$('<br / ><input type="button" value="delete" onClick=deletePost("' + id + '") /> <hr />') 
	
	) );
  }

  function removePost(data) {
    $( '#' + get_id( data ) ).remove();
  }


  function get_id(data) {
// Parse "12345" from string like: ObjectId("12345")
    var msgId = data.id.substring(data.id.indexOf('"') + 1);
    msgId = msgId.substring(0, msgId.indexOf('"'));
    return msgId;
  }

  liveoak.connect( function() {
    liveoak.create( '/blog/storage', { id: 'post' }, {
      success: function(data) {
        liveoak.subscribe( '/blog/storage/post/*', function(data, action) {
          if (action == 'create') {
            addPost( data );
          } else if (action == 'delete') {
            removePost( data );
          }
        } );
        liveoak.read( '/blog/storage/post?fields=*(*)', {
          success: function(data) {
            $(data.members).each( function(i, e) {
              addPost( e );
            } );
          }
        } );
      },
      error: function(data) {
        console.log( "post collection NOT created" );
      }
    } );
  } );
  
  $('#postForm').submit( function() {
    var title = $( '#newTitle' ).val();
    var content = $( '#newContent' ).val();

    $('#newTitle').val( '' );
    $('#newContent').val( '' );

    liveoak.create( '/blog/storage/post',
                    { title: title, content: content },
                    { success: function(data) { 
                        console.log( "Post Saved" ); 
                      },
                      error: function() {
                        console.log( "Error saving post" );
                      }
                  } );
    return false;
  } );

} )
