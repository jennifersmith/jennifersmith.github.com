describe("TodoListFetcher", function() {
  var FAKE_URL = "http://rememberthemilk.com/feed";
	var todoListFetcher;
	var request;
	beforeEach(funtion() {
		todoListFetcher = new TodoListFetcher(FAKE_URL);
	});
	describe("load", function(){
		beforeEach(function(){
			onSuccess = jasmine.createSpy('onSuccess');
			todoListFetcher.load(onSuccess);
			request = mostRecentAjaxRequest();
		});
    it("should fetch atom feed from given URL", function(){
			expect(request.url).toEqual(FAKE_URL);
		});
	});
});

