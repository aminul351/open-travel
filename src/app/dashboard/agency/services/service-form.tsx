"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_TYPE } from "@/lib/constants";

import { createService, updateService, type ServiceFormState } from "./actions";

type ServiceDetails = Record<string, unknown>;

type ServiceFormData = {
  id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  featured: boolean;
  details: ServiceDetails | null;
  status: string;
};

const LOCATION_LABEL: Record<string, string> = {
  HOTEL: "City / area",
  TRANSPORTATION: "Route / destination",
  PACKAGE: "Destination",
};

export function ServiceForm({
  service,
  submitLabel = "Save service",
}: {
  service?: ServiceFormData;
  submitLabel?: string;
}) {
  const [type, setType] = useState(service?.type ?? SERVICE_TYPE.PACKAGE);
  const [currency, setCurrency] = useState(service?.currency ?? "USD");

  const action = service ? updateService : createService;
  const [state, formAction, pending] = useActionState<ServiceFormState, FormData>(
    action,
    { error: null }
  );

  const details = service?.details ?? {};
  const location =
    typeof details.location === "string" ? details.location : "";
  const asString = (key: string) =>
    typeof details[key] === "string" ? String(details[key]) : "";
  const asNumber = (key: string) =>
    typeof details[key] === "number" ? Number(details[key]) : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <input type="hidden" name="id" value={service?.id ?? ""} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="currency" value={currency} />

      {service && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Current status: <StatusBadge status={service.status} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={service?.title ?? ""}
          required
          maxLength={200}
          placeholder="e.g. Everest Base Camp Trek"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Service type</Label>
        <Select value={type} onValueChange={(value) => setType(value ?? SERVICE_TYPE.PACKAGE)}>
          <SelectTrigger id="type" className="w-full" aria-label="Service type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SERVICE_TYPE.HOTEL}>Hotel</SelectItem>
            <SelectItem value={SERVICE_TYPE.TRANSPORTATION}>
              Transportation
            </SelectItem>
            <SelectItem value={SERVICE_TYPE.PACKAGE}>Package</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          {LOCATION_LABEL[type] ?? "Location"} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          name="location"
          defaultValue={location}
          required
          minLength={2}
          placeholder={
            type === SERVICE_TYPE.PACKAGE
              ? "e.g. Kathmandu, Nepal"
              : type === SERVICE_TYPE.HOTEL
                ? "e.g. Thamel, Kathmandu"
                : "e.g. Kathmandu – Pokhara"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">
            Price (USD) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            max="1000000"
            step="0.01"
            defaultValue={service ? Number(service.price).toString() : ""}
            required
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(value) => setCurrency(value ?? "USD")}>
            <SelectTrigger id="currency" className="w-full" aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
              <SelectItem value="GBP">GBP — British Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={service?.description ?? ""}
          required
          maxLength={5000}
          placeholder="Describe what you offer, what's included, and anything guests should know."
        />
      </div>

      {type === SERVICE_TYPE.HOTEL && (
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Hotel details</legend>
          <div className="space-y-2">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={asString("address")}
              placeholder="e.g. 123 Lakeside Rd"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in time</Label>
              <Input
                id="checkIn"
                name="checkIn"
                defaultValue={asString("checkIn")}
                placeholder="e.g. 14:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out time</Label>
              <Input
                id="checkOut"
                name="checkOut"
                defaultValue={asString("checkOut")}
                placeholder="e.g. 11:00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomsAvailable">Rooms available</Label>
            <Input
              id="roomsAvailable"
              name="roomsAvailable"
              type="number"
              inputMode="numeric"
              min="0"
              defaultValue={asNumber("roomsAvailable")}
              placeholder="e.g. 24"
            />
          </div>
        </fieldset>
      )}

      {type === SERVICE_TYPE.TRANSPORTATION && (
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">
            Transportation details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle type</Label>
              <Input
                id="vehicleType"
                name="vehicleType"
                defaultValue={asString("vehicleType")}
                placeholder="e.g. Private SUV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (seats)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min="1"
                max="500"
                defaultValue={asNumber("capacity")}
                placeholder="e.g. 6"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                name="from"
                defaultValue={asString("from")}
                placeholder="e.g. Kathmandu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                name="to"
                defaultValue={asString("to")}
                placeholder="e.g. Pokhara"
              />
            </div>
          </div>
        </fieldset>
      )}

      {type === SERVICE_TYPE.PACKAGE && (
        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Package details</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="durationDays">Days</Label>
              <Input
                id="durationDays"
                name="durationDays"
                type="number"
                inputMode="numeric"
                min="1"
                max="365"
                defaultValue={asNumber("durationDays")}
                placeholder="e.g. 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationNights">Nights</Label>
              <Input
                id="durationNights"
                name="durationNights"
                type="number"
                inputMode="numeric"
                min="0"
                max="365"
                defaultValue={asNumber("durationNights")}
                placeholder="e.g. 11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupSizeMax">Max group size</Label>
              <Input
                id="groupSizeMax"
                name="groupSizeMax"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000"
                defaultValue={asNumber("groupSizeMax")}
                placeholder="e.g. 12"
              />
            </div>
          </div>
        </fieldset>
      )}

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          inputMode="url"
          defaultValue={service?.imageUrl ?? ""}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={service?.featured ?? false}
          className="size-4 accent-primary"
        />
        Featured service (highlighted on your profile)
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Button
          render={<Link href="/dashboard/agency/services" />}
          type="button"
          variant="outline"
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}