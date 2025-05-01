package com.camyo.backend.UI;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import java.util.*;

public class ChatUITest {
  private WebDriver driver;
  private Map<String, Object> vars;
  JavascriptExecutor js;
  @Before
  public void setUp() {
    driver = new FirefoxDriver();
    js = (JavascriptExecutor) driver;
    vars = new HashMap<String, Object>();
  }
  @After
  public void tearDown() {
    driver.quit();
  }
  @Test
  public void chat() {
    driver.get("http://localhost:8081/");
    driver.findElement(By.cssSelector(".r-color-jwli3a")).click();
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu usuario']")).click();
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu usuario']")).sendKeys("isabel");
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu contraseña']")).sendKeys("12");
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu contraseña']")).sendKeys(Keys.ENTER);
    try {
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.findElement(By.xpath("//div[text()='Menú']")).click();
    driver.findElement(By.xpath("//div[text()='Mis mensajes']")).click();
    driver.findElement(By.cssSelector(".r-paddingBlock-11f147o:nth-child(1) > .css-text-146c3p1")).click();
    driver.findElement(By.cssSelector(".css-view-175oi2r:nth-child(1) > .css-view-175oi2r:nth-child(1) > .css-view-175oi2r > .css-view-175oi2r:nth-child(2) > .css-view-175oi2r:nth-child(2) > .css-text-146c3p1")).click();
    driver.findElement(By.cssSelector(".r-maxHeight-1xpiuri")).click();
    driver.findElement(By.cssSelector(".r-maxHeight-1xpiuri")).sendKeys("Mensaje de prueba");
    driver.findElement(By.cssSelector(".r-maxHeight-1xpiuri")).sendKeys(Keys.ENTER);
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.findElement(By.cssSelector(".r-borderColor-2dyu53 > .css-accessibilityImage-9pa8cd")).click();
    driver.findElement(By.cssSelector(".r-paddingBlock-ytbthy:nth-child(2)")).click();
    driver.findElement(By.cssSelector(".r-borderRadius-y47klf:nth-child(2) > .css-text-146c3p1")).click();
  }
}
