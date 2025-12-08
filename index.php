<?php
$submitted = ($_SERVER["REQUEST_METHOD"] === "POST");
$name = $email = $course = "";
if ($submitted) {
    $name   = htmlspecialchars($_POST["name"] ?? "");
    $email  = htmlspecialchars($_POST["email"] ?? "");
    $course = htmlspecialchars($_POST["course"] ?? "");
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Online Registration</title>
    <style>
        body { font-family: Arial, sans-serif; background:#f0f0f0; }
        .box { width:350px; margin:40px auto; background:#fff; padding:15px; border-radius:6px; box-shadow:0 0 5px #999; }
        h1, h2 { text-align:center; margin:10px 0; }
        label { display:block; margin-top:8px; }
        input, select { width:100%; padding:6px; margin-top:3px; box-sizing:border-box; }
        button { margin-top:10px; width:100%; padding:8px; background:#007bff; color:#fff; border:none; border-radius:4px; cursor:pointer; }
        button:hover { background:#0056b3; }
        #error { color:red; font-size:13px; margin-top:5px; }
        .result { margin-top:15px; padding:10px; border-radius:4px; background:#e9f5ff; }
        .result p { margin:3px 0; }
        .label { font-weight:bold; }
    </style>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        $(function () {
            $("#regForm").on("submit", function (e) {
                let n = $("#name").val().trim();
                let m = $("#email").val().trim();
                if (n === "" || m === "") {
                    e.preventDefault();
                    $("#error").text("Please enter Name and Email.");
                } else {
                    $("#error").text("");
                }
            });
        });
    </script>
</head>
<body>
    <div class="box">
        <h1>Registration Form</h1>
        <form id="regForm" method="post">
            <label>Name:
                <input type="text" id="name" name="name" value="<?php echo $name; ?>">
            </label>
            <label>Email:
                <input type="email" id="email" name="email" value="<?php echo $email; ?>">
            </label>
            <label>Course:
                <select name="course">
                    <option value="">Select</option>
                    <option <?php if($course==="CSE")  echo "selected"; ?>>CSE</option>
                    <option <?php if($course==="ECE")  echo "selected"; ?>>ECE</option>
                    <option <?php if($course==="MECH") echo "selected"; ?>>MECH</option>
                </select>
            </label>
            <div id="error"></div>
            <button type="submit">Submit</button>
        </form>

        <?php if ($submitted && $name !== "" && $email !== ""): ?>
            <div class="result">
                <h2>Application Details</h2>
                <p><span class="label">Name:</span> <?php echo $name; ?></p>
                <p><span class="label">Email:</span> <?php echo $email; ?></p>
                <p><span class="label">Course:</span> <?php echo $course; ?></p>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
