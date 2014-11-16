<html>

<head>
<title>WebGL OBJ Viewer</title>

<!-- Disable all caching during development -->
<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta http-equiv="expires" content="0" />
<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
<meta http-equiv="pragma" content="no-cache" />

<!-- dependencies -->
<script type="text/javascript" src="obj.js"></script>
<script type="text/javascript" src="jquery-2.1.0.min.js"></script>
<script type="text/javascript" src="glMatrix-0.9.5.min.js"></script>
<script type="text/javascript" src="webgl-utils.js"></script>

<!-- Meshview Program -->
<script type="text/javascript" src="meshview.js"></script>

<style>
    body, html 
    { 
        width: 100%;
        height: 100%;
        border: 0px;
        padding: 0px;
        margin: 0px;
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
    	top:20px; left:30px;
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
</style>
</head>

<?php
error_reporting(0);
?>

<body bgcolor="#000000">
	<div id="overlay">
		<form action="meshview.php" method="post">
			<input type="text" id="urlbox" name="model" value="<?php file_put_contents('tmp.jpg', file_get_contents($_POST['model'])); echo $_POST["model"]; ?>">
            <input type="submit" id="urlbutton">
            			<!-- <button id="urlbutton" onclick="submitOBJ();return false;">Load OBJ</button><br> -->
		</form>
	</div>
    <canvas id="glCanvas"></canvas>

    
</body>

</html>