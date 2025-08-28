from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

import time

# Driver path
chrome_driver_path = 'C:\\Users\\naman\\Downloads\\New folder (5)\\chromedriver-win64\\chromedriver-win64'
driver = webdriver.Chrome()
driver.maximize_window()

# Open webpage
driver.get('https://www.amazon.in')
wait = WebDriverWait(driver, 20)

# Scroll down slowly to the bottom of the page
last_height = driver.execute_script("return document.body.scrollHeight")
scroll_pause_time = 1  # Pause time between scrolls in seconds

while True:
    # Scroll down by a specific amount (e.g., 500 pixels)
    driver.execute_script("window.scrollBy(0, 1000);")
    
    # Wait to load the page
    time.sleep(scroll_pause_time)
    
    # Calculate new scroll height and compare with last scroll height
    new_height = driver.execute_script("return document.body.scrollHeight")
    if new_height == last_height:
        break
    last_height = new_height

# Retrieve images
images = driver.find_elements(By.TAG_NAME, 'img')
image_urls = [image.get_attribute('src') for image in images]

for url in image_urls:
    print(url)

# Wait before closing the browser
time.sleep(10)
driver.quit()
