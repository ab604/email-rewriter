import os
import openai
from dotenv import load_dotenv

# Load your OpenAI API key from an environment variable
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def rewrite_email(draft_text):
    """
    Rewrite the given draft text using a large language model (GPT-3).
    
    Parameters:
    draft_text (str): The original draft text to be rewritten.
    
    Returns:
    str: The rewritten email text.
    """
    prompt = f"Rewrite the following email draft in a more concise and professional tone:\n\n{draft_text}\n\nRewritten email:"
    
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    rewritten_text = response.choices[0].text.strip()
    return rewritten_text

# Example usage
draft_email = """
Dear Valued Customer,

I hope this email finds you well. I am writing to follow up on the issue you reported with your recent order. I understand that you have been experiencing some difficulties with the product and I would like to apologize for any inconvenience this may have caused.

Please let me know if there is anything I can do to assist you with this matter. I am committed to ensuring that you are fully satisfied with your purchase and I will do my best to resolve this issue as quickly as possible.

Thank you for your patience and understanding. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Company]
"""

rewritten_email = rewrite_email(draft_email)
print(rewritten_email)
