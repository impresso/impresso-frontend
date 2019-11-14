build-docker-image:
	# PUBLIC_PATH=/app/ npm run build || true
	docker build -t impresso/impresso-frontend .
