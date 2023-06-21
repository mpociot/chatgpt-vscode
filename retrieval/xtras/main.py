import logging
import openai
from chat_utils import ask
from database_utils import upsert_file
from secrets import OPENAI_API_KEY

project_home = '.'

if __name__ == "__main__":
    project_home = input("Enter your project directory: ")
    upsert_file(project_directory)
    while True:
        user_query = input("Enter your question: ")
        openai.api_key = OPENAI_API_KEY
        logging.basicConfig(level=logging.WARNING,
                            format="%(asctime)s %(levelname)s %(message)s")
        print(ask(user_query))