$(document).ready(function() {
	$('.delete').click(function(){
		$.ajax({
			url: '/api/book/delete',
			type: 'GET',
			data: ''
		})
	})
})