package com.camyo.backend.UI;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import java.util.*;
public class CompraTest {
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
  public void compra() {
    driver.get("http://localhost:8081/");
    driver.manage().window().setSize(new Dimension(1550, 830));
    driver.findElement(By.cssSelector(".r-borderRadius-1xfd6ze > .r-fontSize-ubezar")).click();
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu usuario']")).click();
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu usuario']")).sendKeys("emp_piloto14");
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu contraseña']")).sendKeys("cont");
    driver.findElement(By.xpath("//input[@placeholder='Escribe tu contraseña']")).sendKeys(Keys.ENTER);
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.findElement(By.cssSelector(".r-borderColor-2dyu53 > .css-accessibilityImage-9pa8cd")).click();
    driver.findElement(By.cssSelector(".r-backgroundColor-1tn3y4b > .r-fontSize-1b43r93")).click();
    driver.findElement(By.cssSelector(".css-view-175oi2r:nth-child(2) > .r-backgroundColor-1ngh36q")).click();
    driver.findElement(By.cssSelector(".r-backgroundColor-ry9brz:nth-child(3)")).click();
    driver.findElement(By.cssSelector(".r-backgroundColor-t8qyfj > .css-text-146c3p1")).click();
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.findElement(By.cssSelector(".r-backgroundColor-ry9brz:nth-child(3) > .css-text-146c3p1")).click();
    driver.findElement(By.cssSelector(".r-marginTop-1x0uki6 > .r-userSelect-lrvibr")).click();
    try {
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.switchTo().frame(3);
    driver.findElement(By.id("Field-numberInput")).click();
    driver.findElement(By.id("Field-numberInput")).sendKeys("4242 4242 4242 4242");
    driver.findElement(By.id("Field-expiryInput")).sendKeys("02 / 42");
    driver.findElement(By.id("Field-cvcInput")).sendKeys("242");
    driver.switchTo().defaultContent();
    driver.findElement(By.cssSelector(".r-marginTop-1x0uki6 > .r-transitionProperty-1i6wzkk")).click();
    js.executeScript("window.scrollTo(0,0)");
    try {
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    driver.findElement(By.cssSelector(".r-borderColor-2dyu53 > .css-accessibilityImage-9pa8cd")).click();
    driver.findElement(By.cssSelector(".r-paddingBlock-ytbthy:nth-child(2)")).click();
    driver.findElement(By.cssSelector(".r-borderRadius-y47klf:nth-child(2) > .css-text-146c3p1")).click();
  }
}
