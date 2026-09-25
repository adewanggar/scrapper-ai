import json
import threading
import unittest
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from unittest.mock import patch

from server import TikTokApiHandler
from test_research_planner import request, titles


class ResearchHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), TikTokApiHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/api/ai/research'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def post(self, body):
        req = urllib.request.Request(self.url, data=body, headers={'Content-Type': 'application/json'})
        with patch('server.APP_PIN', ''):
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    return response.status, json.load(response)
            except urllib.error.HTTPError as response:
                return response.code, json.load(response)

    def test_real_route_calls_existing_ai_client_and_returns_valid_cards(self):
        with patch('research_planner.call_llm', return_value=(json.dumps(titles()), 'mock')):
            status, result = self.post(json.dumps(request()).encode())
        self.assertEqual(status, 200)
        self.assertEqual(len(result['items']), 5)
        self.assertEqual(result['filename'], 'private-cloud-only.json')

    def test_invalid_body_and_empty_dataset_are_client_errors(self):
        for body in (b'broken json', b'[]', b'{}', json.dumps({**request(), 'dataset': {'comments': []}}).encode()):
            status, result = self.post(body)
            self.assertEqual(status, 400)
            self.assertIsInstance(result['error'], str)

    def test_invalid_ai_response_is_not_returned_to_ui(self):
        with patch('research_planner.call_llm', return_value=('not json', 'mock')):
            status, result = self.post(json.dumps(request()).encode())
        self.assertEqual(status, 400)
        self.assertNotIn('items', result)

    def test_oversized_request_rejected_before_reading_body(self):
        req = urllib.request.Request(self.url, data=b'{}', headers={'Content-Length': str(21 * 1024 * 1024)})
        with patch('server.APP_PIN', ''), self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(req, timeout=5)
        self.assertEqual(caught.exception.code, 413)
