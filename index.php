<html>

<head>
<title>MeshView Start</title>

<style>
    body, html 
    { 
        width: 100%;
        height: 100%;
        border: 0px;
        padding: 0px;
        margin: 0px;
        background-image:url('back.jpg'); 
        background-repeat:no-repeat;
        background-position:bottom right;
    }
    #glCanvas 
    {
        width: 100%;
        height: 100%;
        z-index:0;

    }

    #overlay
    {
    	position:absolute;
    	top:30%; left:35%;
    	z-index:100;
    	color:white;
    	opacity:0.75;
    }
    #urlbox
    {
    	width:350px;
    	height:30px;
    }
    #urlbutton
    {
    	height:30px;
    }

    #footer 
    {
        position: fixed; 
        bottom: 0;
        left: 0;
        right: 0;
        height: 25px;
        margin-left:10px;
        color:gray;
    }

    .slide
    {
      -webkit-animation-duration: 1s;
      animation-duration: 1s;
      
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
    }

@-webkit-keyframes slideDown 
{
  0% 
  {
    opacity: 0;
    -webkit-transform: translateY(-60px);
    transform: translateY(-60px);
  }
  100% 
  {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}

@keyframes slideDown 
{
  0% 
  {
    opacity: 0;
    -webkit-transform: translateY(-20px);
    -ms-transform: translateY(-20px);
    transform: translateY(-20px);
  }
  100% 
  {
    opacity: 1;
    -webkit-transform: translateY(0);
    -ms-transform: translateY(0);
    transform: translateY(0);
  }
}


.slideDown 
{
  -webkit-animation-name: slideDown;
  animation-name: slideDown;
}

a:link {color:gray;}      /* unvisited link */
a:visited {color:gray;}  /* visited link */
a:hover {color:gray;}  /* mouse over link */
a:active {color:gray;}  /* selected link */

p
{
    color:gray;
    font-size: 10px;
    font-family: arial;
}

</style>
</head>

<?php
error_reporting(0);
?>

<body bgcolor="#000000">
	<div id="overlay">
        <img src="logo.png" class="slide slideDown"><br>
		<form action="meshview.php" method="post">
			<input type="text" id="urlbox" name="model" value="<?php file_put_contents('tmp.jpg', file_get_contents($_POST['model'])); if ($_POST["model"] == "") echo "cat.obj"; else echo $_POST["model"]; ?>">
            <input type="hidden" name="dummy" value="something">
            <input type="submit" id="urlbutton"><br>
            <p>Enter the URL to an obj file or try one of these: cat.obj, 747.obj, suzanne.obj, teapot.obj.</p>
		</form>
	</div>
    <div id="footer">
        Created by <a href="http://github.com/andrew197">Andrew Pinion</a>
   </div>
</body>

</html>

