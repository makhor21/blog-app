$(document).ready(() => {
  $("#submitBtn").click(() => {
    console.log($("#radioBtn input[type='radio']:checked").val());
    $("#alertMsg").addClass("d-none");
    $("#alertMsg2").addClass("d-none");
    $("#alertMsg3").addClass("d-none");
    $("#alertMsg4").addClass("d-none");
    $("#alertMsg5").addClass("d-none");
    $("#msg").addClass("d-none");
    $("#msg2").addClass("d-none");
    $("input").each(function () {
      if (!$(this).val()) {
        $(this).addClass("plc");
        $("#alertMsg").removeClass("d-none");
      } else if ($(this).val()) {
        if (
          !(
            $("#username").val().length > 3 && $("#username").val().length < 30
          ) &&
          $("#username").val() !== ""
        ) {
          $("#alertMsg2").removeClass("d-none");
        } else if ($("#password").val() !== $("#rePassword").val()) {
          $("#alertMsg3").removeClass("d-none");
        } else if (
          !$("#password")
            .val()
            .match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/) &&
          $("#password").val() !== ""
        ) {
          $("#alertMsg4").removeClass("d-none");
        } else if (
          !$("#mobileNumber")
            .val()
            .match(/^\d{11}$/) &&
          $("#mobileNumber").val() !== ""
        ) {
          $("#alertMsg5").removeClass("d-none");
        }
      }
    });
    if (
      $("#firstName").val().length >= 3 &&
      $("#firstName").val().length <= 30 &&
      $("#lastName").val().length >= 3 &&
      $("#lastName").val().length <= 30 &&
      $("#username").val().length >= 3 &&
      $("#username").val().length <= 30 &&
      $("#password").val() === $("#rePassword").val() &&
      $("#password")
        .val()
        .match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/) &&
      $("#mobileNumber")
        .val()
        .match(/^\d{11}$/)
    ) {
      $.ajax({
        type: "post",
        url: "/register",
        data: {
          firstName: $("#firstName").val().trim(),
          lastName: $("#lastName").val().trim(),
          username: $("#username").val().trim(),
          password: $("#password").val(),
          gender: $("#radioBtn input[type='radio']:checked").val(),
          mobileNumber: $("#mobileNumber").val().trim(),
        },
        success: function (response) {
          $("#msg").removeClass("d-none");
          setTimeout(function () {
            window.location.href = "/login";
          }, 2500);
        },
        error: function (err) {
          console.log(err);
          let error = JSON.parse(err.responseText);
          if (error.msg == "user exist") {
            $("#alertMsg2").removeClass("d-none");
          }
          if (error.msg == "phone number") {
            $("#alertMsg5").removeClass("d-none");
          }
        },
      });
    } else {
      $("#msg2").removeClass("d-none");
    }
  });
});
