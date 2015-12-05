// Utils
var eventBus = $({});

function request(method, url, params) {
  console.log(arguments);
  return $.ajax({
    method: method,
    url: url,
    data: params,
    dataType: 'json'
  });
}

// Todo Model
function Todo(id, text, isCompleted) {
  this.id = id;
  this.text = text;
  this.isCompleted = isCompleted;
};

Todo.prototype.delete = function () {
  return request("delete", "/todos/" + this.id).done(function () {
    eventBus.trigger("delete", this);
  });
};

Todo.prototype.create = function () {
  return request("post", "/todos/", {text: this.text}).done(function (newTodo) {
    eventBus.trigger("create", newTodo.id);
  });
};

Todo.prototype.complete = function () {
  return request("patch", "/todos/" + this.id).done(function () {
    eventBus.trigger("complete", this);
  });
};

// TodoView

function TodoView(model) {
  this.$el = $("<li/>");
  this.$el.html(model.text);
  this.$el.data('model', model);

  var checker = $("<input type='checkbox'/>");
  checker.on("click", function () {
    var check = checker.is(":checked");
    if (check) {
      model.complete();
    }
  });
  this.$el.prepend(checker);

  eventBus.on("complete", function (e, data) {
    if (data === model) {
      this.$el.fadeOut(100).remove();
    }
  });
}

// Main

(function main() {
  request("get", "/todos").done(function (todos) {
    todos.forEach(function (todo) {
      var model = new Todo(todo.id, todo.text, todo.isCompleted);
      var view = new TodoView(model);
      $("#todos").append(view.$el);
    });
  });

  $("#add_todo").click(function () {
    var model = new Todo(null, $("#new_todo").val());
    model.create().done(function (data) {

      var view = new TodoView(model);
      $("#todos").append(view.$el);
    });
  });
})();
